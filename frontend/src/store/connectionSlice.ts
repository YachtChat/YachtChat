import {createSlice} from '@reduxjs/toolkit';
import {AppThunk} from './store';
import {User, UserCoordinates} from "./models";
import {getUser, getUserID, handlePositionUpdate, removeUser, setUser, setUserId, setUsers} from "./userSlice";
import {handleError} from "./statusSlice";
import {destroySession, handleCandidate, handleRTCEvents, handleSdp, requestUserMediaAndJoin} from "./rtcSlice";

let websocket_url: string | undefined = process.env.REACT_APP_WEBSOCKET_URL;

if (process.env.NODE_ENV === "development") {
    websocket_url = process.env.REACT_APP_WEBSOCKET_URL_LOCAL;
}

interface WebSocketState {
    connected: boolean
    loggedIn: boolean
}

let socket: WebSocket | null = null;

const initialState: WebSocketState = {
    connected: false,
    loggedIn: false
};

export const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connect: (state) => {
            state.connected = true
        },
        login: (state) => {
            state.loggedIn = true
        },
        logout: (state) => {
            state.loggedIn = false
        },
        disconnect: (state) => {
            state.connected = false
        },
    },
});

export const {connect, disconnect, login, logout} = webSocketSlice.actions;

export const connectToServer = (): AppThunk => (dispatch, getState) => {
    //socket = new WebSocket('wss://call.tristanratz.com:9090')
    if (!websocket_url) {
        dispatch(handleError("No websocket url defined for this environment"))
        return
    }

    socket = new WebSocket(websocket_url, 'json');

    socket.onopen = () => {
        console.log("Connected to the signaling server");
        dispatch(connect())
    };

    socket.onerror = (err) => {
        console.log("Got error", err);
        dispatch(disconnect())
    };

    socket.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        //if (data.type !== "position_change")
        //    console.log("Got message", msg.data);
        const loggedIn = getState().webSocket.loggedIn

        switch (data.type) {
            case "id":
                dispatch(setUserId(data.id))
                break;
            case "login":
                dispatch(handleLogin(data.success));
                break;
            case "join":
                dispatch(setUsers(data.users));
                const count = Object.keys(getState().userState.otherUsers).length + 1;
                dispatch(handleRTCEvents(getUserID(getState()), count));
                const user = getUser(getState())
                dispatch(handlePositionUpdate({id: user.id, position: user.position}))
                break;
            case "new_user":
                if (loggedIn) {
                    dispatch(setUser(data.user));
                    const count = Object.keys(getState().userState.otherUsers).length + 1;
                    dispatch(handleRTCEvents(data.user.id, count));
                    dispatch(handlePositionUpdate({id: data.user.id, position: data.user.position}))
                }
                break;
            case "user_left":
                if (loggedIn)
                    dispatch(removeUser(data.id))
                break;
            case "position_change":
                if (loggedIn && data.id !== getUserID(getState()))
                    dispatch(handlePositionUpdate(data));
                break;
            case "signaling":
                if (!loggedIn)
                    break;
                const fromId: number = data.source;
                if (fromId !== getUserID(getState())) {
                    switch (data.signal_type) {
                        case "candidate":
                            dispatch(handleCandidate(data.candidate, fromId))
                            break;
                        case "sdp":
                            dispatch(handleSdp(data.description, fromId));
                            break;
                        default:
                            dispatch(handleError("Unknown signaling type."))
                    }
                }
                break;
            default:
                dispatch(handleError("Unknown server event"))
                break
        }
    };

};

export const send = (message: { [key: string]: any }, target?: User): AppThunk => (dispatch, getState) => {
    //attach the other peer username to our messages
    const msgObj = {
        ...message,
        id: getUserID(getState()),
    }

    if (socket !== null)
        socket.send(JSON.stringify(msgObj));
}

export const requestLogin = (name: string): AppThunk => (dispatch) => {
    if (name.length > 0) {
        dispatch(send({
            type: "login",
            name: name,
        }));
    }
}

export const sendLogout = (): AppThunk => (dispatch) => {
    dispatch(send({type: "leave"}))
    dispatch(logout())
    destroySession()
}

export const sendPosition = (position: UserCoordinates): AppThunk => (dispatch) => {
    dispatch(send({
        type: "position_change",
        position,
    }));
}

export const handleLogin = (success: boolean): AppThunk => (dispatch, getState) => {
    if (!success) {
        dispatch(handleError("Login failed. Try different user name."))
        alert("Ooops...try a different username");
    } else {
        //**********************
        //Starting a peer connection
        //**********************

        dispatch(login())
        dispatch(requestUserMediaAndJoin())
    }
}

export const sendUsername = (name: string): AppThunk => dispatch => {
    dispatch(send({type: "login", name: name}))
}

export default webSocketSlice.reducer;
