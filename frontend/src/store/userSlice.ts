import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";
import {sendPosition} from "./connectionSlice";
import {sendAudio, unsendAudio} from "./rtcSlice";

interface UserState {
    activeUser: User
    otherUsers: { [key: number]: User }
}

const initialState: UserState = {
    activeUser: {id: -1, name: "name", position: {x: 0, y: 0, range: 0.2}},
    otherUsers: {},
};

export const userProportion = 100
export const maxRange = 300

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        move: (state, action: PayloadAction<{ id: number, position: UserCoordinates }>) => {

            if (state.activeUser.id === action.payload.id) {
                state.activeUser.position = action.payload.position;
            }
            if (!state.otherUsers[action.payload.id])
                return
            state.otherUsers[action.payload.id].position = action.payload.position
        },
        changeRadius: (state, action: PayloadAction<number>) => {
            state.activeUser.position.range = action.payload;
        },
        gotRemoteStream: (state, action: PayloadAction<number>) => {
            if (state.activeUser.id === action.payload)
                state.activeUser.userStream = true
            else
                state.otherUsers[action.payload].userStream = true
        },
        setUserId: (state, action: PayloadAction<number>) => {
            state.activeUser.id = action.payload
            state.activeUser.inProximity = true
        },
        setName: (state, action: PayloadAction<any>) => {
            if (action.payload.id)
                state.activeUser.name = action.payload.name
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.otherUsers[action.payload.id] = action.payload
        },
        removeUser: (state, action: PayloadAction<number>) => {
            delete state.otherUsers[action.payload]
        },
        setUsers: (state, action: PayloadAction<{ [key: number]: User }>) => {
            const otherUsers: { [key: number]: User } = {}

            Object.keys(action.payload).forEach(k => {
                const id = Number(k)
                if (id === state.activeUser.id) {
                    state.activeUser.position = action.payload[id].position
                } else if (action.payload[id].name && action.payload[id].position) {
                    otherUsers[id] = action.payload[id]
                }
            })
            state.otherUsers = otherUsers
            // action.payload.filter(u => u.id !== state.activeUser.id && u.name !== null).forEach(u => {
            //     state.otherUsers[u.id] = u
            // })
        },
    },
});

export const {
    move,
    changeRadius,
    gotRemoteStream,
    setUser,
    setName,
    setUsers,
    removeUser,
    setUserId
} = userSlice.actions;

export const submitMovement = (coordinates: UserCoordinates): AppThunk => (dispatch, getState) => {
    const user = getState().userState.activeUser
    if (user.position !== coordinates) {
        dispatch(sendPosition(coordinates))
        dispatch(handlePositionUpdate({id: user.id, position: coordinates}))
    }
}

export const handlePositionUpdate = (object: { id: number, position: UserCoordinates }): AppThunk => (dispatch, getState) => {
    dispatch(move(object))
    const user = getState().userState.activeUser
    const currentRange = maxRange * user.position.range

    let users: User[] = []

    if (user.id === object.id)
        users = getUsers(getState())
    else
        users.push(getUserById(getState(), object.id))

    // if (getUser(getState()).position === user.position)
    users.forEach(u => {
        const dist = Math.sqrt(
            Math.pow(((u.position.x) - (user.position.x)), 2) +
            Math.pow(((u.position.y) - (user.position.y)), 2)
        )
        if (dist <= (currentRange + userProportion / 2) && !u.inProximity) {
            console.log(user.id, "in Range - sending audio to", u.id)
            dispatch(sendAudio(u.id))
            dispatch(setUser({...u, inProximity: true}))
        } else if (dist > (currentRange + userProportion / 2) && (!!u.inProximity || u.inProximity === undefined)) {
            console.log(user.id, "not in Range - dont send audio", u.id)
            dispatch(unsendAudio(u.id))
            dispatch(setUser({...u, inProximity: false}))
        }
    })
}

export const submitRadius = (radius: number): AppThunk => (dispatch, getState) => {
    dispatch(changeRadius(radius))
    dispatch(sendPosition(getState().userState.activeUser.position))
};


export const submitNameChange = (name: string): AppThunk => dispatch => {
    dispatch(setName(name))
};

export const getUser = (state: RootState) => state.userState.activeUser;
export const getUserID = (state: RootState) => state.userState.activeUser.id;
export const getUserById = (state: RootState, id: number) => state.userState.otherUsers[id];
export const getUsers = (state: RootState) => Object.keys(state.userState.otherUsers).map(
    id => state.userState.otherUsers[Number(id)]
);

export default userSlice.reducer;
