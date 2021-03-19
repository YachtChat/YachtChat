import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";
import {handlePositionUpdate, requestUserMedia, setName, updateUsers} from "./userSlice";

interface WebSocketState {
    id: number
    connected: boolean
    loggedIn: boolean
}

let socket: WebSocket | null = null;
let rtcConnection: RTCPeerConnection | null = null;

const initialState: WebSocketState = {
    id: -1,
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
        saveID: (state, action: PayloadAction<number>) => {
            state.id = action.payload
        }
    },
});

export const {connect, disconnect, login, logout, saveID} = webSocketSlice.actions;

export const connectToServer = (): AppThunk => (dispatch, getState) => {
    //socket = new WebSocket('wss://call.tristanratz.com:9090');
    socket = new WebSocket('wss://www.alphabibber.com:6503', 'json');

    socket.onopen = () => {
        console.log("Connected to the signaling server");
        dispatch(connect())
    };

    socket.onerror = (err) => {
        console.log("Got error", err);
        dispatch(disconnect())
    };

    socket.onmessage = function (msg) {
        console.log("Got message", msg.data);
        var data = JSON.parse(msg.data);

        switch (data.type) {
            case "id":
                dispatch(saveID(data.id))
                break;
            case "userlist":
                dispatch(updateUsers(data.users))
                break;
            case "login":
                dispatch(handleLogin(data.name, data.success));
                break;
            case "position":
                dispatch(handlePositionUpdate(data));
                break;
            //when somebody wants to call us
            case "offer":
                handleOffer(data.offer, data.name);
                break;
            case "answer":
                handleAnswer(data.answer);
                break;
            //when a remote peer sends an ice candidate to us
            case "candidate":
                handleCandidate(data.candidate);
                break;
            default:
                break;
        }
    };

};

export const send = (message: { [key: string]: any }, target?: User): AppThunk => (dispatch, getState) => {
    //attach the other peer username to our messages
    const msgObj = {
        ...message,
        id: getState().webSocket.id,
        target: (!!target) ? target.id : undefined,
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

export const sendPosition = (position: UserCoordinates): AppThunk => (dispatch) => {
    dispatch(send({
        type: "position",
        position,
    }));
}

export const handleCandidate = (candidate: any) => {
    rtcConnection!.addIceCandidate(new RTCIceCandidate(candidate));
}


export const handleLogin = (success: boolean, name: string): AppThunk => (dispatch, getState) => {
    if (!success) {
        alert("Ooops...try a different username");
    } else {
        //**********************
        //Starting a peer connection
        //**********************

        dispatch(login())
        dispatch(setName({name, id: getState().webSocket.id}))
        dispatch(requestUserMedia((stream: MediaStream) => {

            let configuration = {
                "iceServers": [{"urls": "stun:stun2.1.google.com:19302"}]
            }

            rtcConnection = new RTCPeerConnection(configuration)

            // setup stream listening

            stream.getTracks().forEach(track =>
                rtcConnection?.addTrack(track, stream)
            )

            //when a remote user adds stream to the peer connection, we display it
            // rtcConnection.onaddstream = (e) => {
            //     const inStream = new MediaStream(e.stream);
            //     remoteAudio.srcObject = inStream;
            // };

            // Setup ice handling
            rtcConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    send({
                        type: "candidate",
                        candidate: event.candidate
                    });
                }
            };

        }))
    }
}

//when somebody sends us an offer
const handleOffer = (offer: any, name: string) => {
    const connectedUser = name;
    // dispatch add user

    if (!rtcConnection)
        return
    rtcConnection.setRemoteDescription(new RTCSessionDescription(offer));

    //create an answer to an offer
    rtcConnection.createAnswer().then((answer: any) => {
        if (!rtcConnection)
            return
        rtcConnection!.setLocalDescription(answer);

        send({
            type: "answer",
            answer: answer
        });

    });

}

export const sendUsername = (name: string): AppThunk => dispatch => {
    dispatch(send({type: "username", name: name}))
}

export const leaveChat = (): AppThunk => dispatch => {
    dispatch(logout())
    dispatch(send({type: "leave"}))
    rtcConnection?.close()
}

//when we got an answer from a remote user
function handleAnswer(answer: any) {
    if (rtcConnection)
        rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function createOffer(callToUsername: string) {
    if (callToUsername.length > 0) {
        const connectedUser = callToUsername;

        if (!rtcConnection)
            return

        // create an offer
        rtcConnection.createOffer().then(function (offer) {
            send({
                type: "offer",
                offer: offer
            });

            rtcConnection!.setLocalDescription(offer);
        });
    }
}

export const getUser = (state: RootState) => state.userState.activeUser;

export default webSocketSlice.reducer;
