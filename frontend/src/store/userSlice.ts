import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";
import {sendPosition} from "./connectionSlice";

interface UserState {
    activeUser: User
    otherUsers: User[]
}

const streams: { [key: string]: MediaStream } = {};

const initialState: UserState = {
    activeUser: {id: -1, name: "name", position: {x: 200, y: 200, range: 1}},
    otherUsers: []
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        move: (state, action: PayloadAction<UserCoordinates>) => {
            state.activeUser.position.x = action.payload.x;
            state.activeUser.position.y = action.payload.y;
        },
        changeRadius: (state, action: PayloadAction<number>) => {
            state.activeUser.position.range = action.payload;
        },
        saveStream: (state, action: PayloadAction<string>) => {
            state.activeUser.userStream = action.payload
        },
        setName: (state, action: PayloadAction<any>) => {
            if (action.payload.id)
                state.activeUser.id = action.payload.id
            state.activeUser.name = action.payload.name
        },
        addUser: (state, action: PayloadAction<User>) => {
            state.otherUsers.push(action.payload)
        }, handlePositionUpdate: (state, action: PayloadAction<any>) => {
            const user = state.otherUsers.find(u => u.id === action.payload.id)
            if (!!user)
                user.position = action.payload.position
        }, updateUsers: (state, action: PayloadAction<User[]>) => {
            state.otherUsers = action.payload.filter(u => u.id !== state.activeUser.id && u.name === null)
        }
    },
});

export const {move, changeRadius, saveStream, addUser, setName, handlePositionUpdate, updateUsers} = userSlice.actions;

export const submitMovement = (coordinates: UserCoordinates): AppThunk => dispatch => {
    dispatch(sendPosition(coordinates))
    dispatch(move(coordinates))
};

export const submitRadius = (radius: number): AppThunk => dispatch => {
    dispatch(changeRadius(radius))
};

export const requestUserMedia = (callback: (stream: MediaStream) => void): AppThunk => dispatch => {
    navigator.mediaDevices.getUserMedia({video: true}).then((e) => {
        streams[e.id] = e
        dispatch(saveStream(e.id))

        callback(e)
    })
};

export const submitNameChange = (name: string): AppThunk => dispatch => {
    dispatch(setName(name))
};

export const getUser = (state: RootState) => state.userState.activeUser;
export const getUserById = (state: RootState, id: number) => state.userState.otherUsers.find(u => u.id === id);
export const getStream = (id: string) => streams[id]

export default userSlice.reducer;
