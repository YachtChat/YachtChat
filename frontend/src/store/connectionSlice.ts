import {createSlice} from '@reduxjs/toolkit';
import {AppThunk} from './store';
import {User, UserCoordinates} from "./models";
import {
    getUser,
    getUserID,
    getUsers,
    handleMessage,
    handlePositionUpdate,
    removeUser,
    setUser,
    setUserId,
    setUsers
} from "./userSlice";
import {handleError, handleSuccess} from "./statusSlice";
import {destroySession, handleCandidate, handleRTCEvents, handleSdp} from "./rtcSlice";
import {SOCKET_PORT, SOCKET_URL} from "./config";

interface WebSocketState {
    connected: boolean
    joinedRoom: boolean
}

let socket: WebSocket | null = null;

const initialState: WebSocketState = {
    connected: false,
    joinedRoom: false
};

export const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connect: (state) => {
            state.connected = true
        },
        joined: (state) => {
            state.joinedRoom = true
        },
        leftRoom: (state) => {
            state.joinedRoom = false
        },
        disconnect: (state) => {
            state.connected = false
        },
    },
});

export const {connect, disconnect, joined, leftRoom} = webSocketSlice.actions;

export const connectToServer = (spaceID: string): AppThunk => (dispatch, getState) => {
    if (!SOCKET_URL) {
        dispatch(handleError("No websocket url defined for this environment"));
        return;
    }

    if (!SOCKET_PORT)
        socket = new WebSocket("wss://" + SOCKET_URL + spaceID);
    else
        socket = new WebSocket("wss://" + SOCKET_URL + ":" + SOCKET_PORT + "/" + spaceID);


    socket.onopen = () => {
        dispatch(connect())
        dispatch(handleSuccess("Connected to the signaling server"))
        dispatch(requestLogin())
    };

    socket.onerror = (err) => {
        console.error("Got error", err);
        dispatch(disconnect())
        dispatch(handleError("Connection failed"))
    };

    socket.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        //if (data.type !== "position_change")
        //    console.log("Got message", msg.data);
        const loggedIn = getState().webSocket.joinedRoom
        switch (data.type) {
            case "id":
                dispatch(setUserId(data.id))
                break;
            case "login":
                dispatch(setUserId(data.id));
                dispatch(handleLogin(data.success));
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
            case "leave":
                if (loggedIn)
                    dispatch(removeUser(data.id))
                break;
            case "position":
                if (loggedIn && data.id !== getUserID(getState()))
                    dispatch(handlePositionUpdate(data));
                break;
            case "signaling":
                if (!loggedIn)
                    break;
                const fromId: string = data.sender_id;
                if (fromId !== getUserID(getState())) {
                    const randomWait = Math.floor(Math.random() * Math.floor(200))
                    switch (data.content.signal_type) {
                        case "candidate":
                            setTimeout(() => dispatch(handleCandidate(data.content.candidate, fromId)), randomWait)
                            break;
                        case "sdp":
                            setTimeout(() => dispatch(handleSdp(data.content.description, fromId)), randomWait)
                            break;
                        case "message":
                            dispatch(handleMessage(data.content.message, fromId))
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

export const sendMessage = (message: string): AppThunk => (dispatch, getState) => {
    getUsers(getState()).forEach(u => {
        if (u.inProximity) {
            dispatch(send({
                type: "signaling",
                target_id: u.id,
                content: {
                    signal_type: "message",
                    message
                }
            }))
        }
    })
    dispatch(handleMessage(message, getUserID(getState())))
}

export const send = (message: { [key: string]: any }, target?: User): AppThunk => (dispatch, getState) => {
    //attach the other peer username to our messages
    const msgObj = {
        ...message,
        id: getUserID(getState()),
    }

    console.log(JSON.stringify(msgObj))

    if (socket !== null)
        socket.send(JSON.stringify(msgObj));
}

export const requestLogin = (): AppThunk => (dispatch, getState) => {
    dispatch(send({
        type: "login",
        user_secret: getState().auth.token,
    }));
}

export const sendLogout = (): AppThunk => (dispatch) => {
    dispatch(send({type: "leave"}))
    dispatch(leftRoom())
    dispatch(destroySession())
}

export const sendPosition = (position: UserCoordinates): AppThunk => (dispatch) => {
    dispatch(send({
        type: "position",
        position,
    }));
}

export const handleLogin = (success: boolean): AppThunk => (dispatch, getState) => {
    if (!success) {
        dispatch(handleError("Login failed. Try again later."))
    } else {
        dispatch(joined())
    }
}

export default webSocketSlice.reducer;
