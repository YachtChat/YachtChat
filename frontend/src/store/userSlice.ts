import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from './store';
import {User, UserCoordinates} from "./models";

interface UserState {
    activeUser: User
    otherUsers: User[]
}

const initialState: UserState = {
    activeUser: {name: "name", coordinate: {x: 0, y: 0}, radius: 4},
    otherUsers: [{name: "name1", coordinate: {x: 100, y: 100}, radius: 3}, {name: "name2", coordinate: {x: 500, y: 500}, radius: 5}]
};

export const userSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        move: (state, action: PayloadAction<UserCoordinates>)=> {
            state.activeUser.coordinate.x = action.payload.x;
            state.activeUser.coordinate.y = action.payload.y;
        },
        changeRadius: (state, action: PayloadAction<number>) => {
            state.activeUser.radius = action.payload;
        },
    },
});

export const { move, changeRadius } = userSlice.actions;

export const submitMovement = (coordinates: UserCoordinates): AppThunk => dispatch => {
    dispatch(move(coordinates))
};

export const submitRadius = (radius: number): AppThunk => dispatch => {
    dispatch(changeRadius(radius))
};

export const getUser = (state: RootState) => state.userState.activeUser;

export default userSlice.reducer;
