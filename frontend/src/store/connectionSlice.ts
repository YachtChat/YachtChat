import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";
import {requestUserMedia} from "./userSlice";

interface WebSocketState {
    connected: boolean
    loggedIn: boolean
}

let socket: WebSocket | null = null;
let rtcConnection: RTCPeerConnection | null = null;

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
        addUser: (state, action: PayloadAction<User>) => {

        }
    },
});

export const {connect, disconnect, login, logout, addUser} = webSocketSlice.actions;

export const connectToServer = (coordinates: UserCoordinates): AppThunk => dispatch => {
    socket = new WebSocket('wss://call.tristanratz.com:9090');

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
            case "login":
                handleLogin(data.success);
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
            case "leave":
                dispatch(handleLeaveChat(data.name));
                break;
            default:
                break;
        }
    };

};

export const send = (message: { [key: string]: any }, toUser?: User) => {
    //attach the other peer username to our messages
    if (toUser) {
        message["name"] = toUser.name;
    }

    if (socket !== null)
        socket.send(JSON.stringify(message));
}

export const requestLogin = (name: string) => {
    if (name.length > 0) {
        send({
            "type": "login",
            "name": name
        });
    }
}

export const handleCandidate = (candidate: any) => {
    rtcConnection!.addIceCandidate(new RTCIceCandidate(candidate));
}


export const handleLogin = (success: boolean): AppThunk => dispatch => {
    if (success === false) {
        alert("Ooops...try a different username");
    } else {
        //**********************
        //Starting a peer connection
        //**********************

        dispatch(login())
        dispatch(requestUserMedia())

        navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(function (myStream) {

            const configuration = {
                "iceServers": [{"url": "stun:stun2.1.google.com:19302"}]
            }

            rtcConnection = new RTCPeerConnection(configuration)

            // setup stream listening
            rtcConnection.addStream(stream);

            //when a remote user adds stream to the peer connection, we display it
            rtcConnection.onaddstream = (e) => {
                const inStream = new MediaStream(e.stream);
                remoteAudio.srcObject = inStream;
            };

            // Setup ice handling
            rtcConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    send({
                        type: "candidate",
                        candidate: event.candidate
                    });
                }
            };

        }).error(function (error) {
            console.log(error);
        });

    }
}

export const leaveChat = (): AppThunk => dispatch => {
    dispatch(logout())
    rtcConnection?.close()
}

export const handleLeaveChat = (name: string): AppThunk => dispatch => {
    // dispatch user rausschmeißen
}

export const getUser = (state: RootState) => state.userState.activeUser;

export default webSocketSlice.reducer;
