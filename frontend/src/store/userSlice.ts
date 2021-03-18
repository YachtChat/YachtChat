import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";

interface UserState {
    activeUser: User
    otherUsers: User[]
}

const streams: { [key: string]: MediaStream } = {};

const initialState: UserState = {
    activeUser: {name: "name", coordinate: {x: 0, y: 0}, radius: 4},
    otherUsers: [{name: "name1", coordinate: {x: 100, y: 100}, radius: 3}, {
        name: "name2",
        coordinate: {x: 500, y: 500},
        radius: 5
    }]
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        move: (state, action: PayloadAction<UserCoordinates>) => {
            state.activeUser.coordinate.x = action.payload.x;
            state.activeUser.coordinate.y = action.payload.y;
        },
        changeRadius: (state, action: PayloadAction<number>) => {
            state.activeUser.radius = action.payload;
        },
        saveStream: (state, action: PayloadAction<string>) => {
            state.activeUser.userStream = action.payload
        },
        setName: (state, action: PayloadAction<string>) => {
            state.activeUser.name = action.payload
        },
        addUser: (state, action: PayloadAction<User>) => {
            state.otherUsers.push(action.payload)
        }
    },
});

export const { move, changeRadius, saveStream, addUser, setName } = userSlice.actions;

export const submitMovement = (coordinates: UserCoordinates): AppThunk => dispatch => {
    dispatch(move(coordinates))
};

export const submitRadius = (radius: number): AppThunk => dispatch => {
    dispatch(changeRadius(radius))
};

export const requestUserMedia = (): AppThunk => dispatch => {
    navigator.mediaDevices.getUserMedia({video: true}).then(e => {
        streams[e.id] = e
        dispatch(saveStream(e.id))
    })
};

export const submitNameChange = (name: string): AppThunk => dispatch => {
    dispatch(setName(name))
};

export const getUser = (state: RootState) => state.userState.activeUser;
export const getStream = (id: string) => streams[id]

export default userSlice.reducer;
