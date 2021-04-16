import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {User, UserCoordinates} from "./models";
import {sendPosition} from "./connectionSlice";
import {sendAudio, unsendAudio} from "./rtcSlice";

interface UserState {
    activeUser: User
    otherUsers: { [key: string]: User }
}

const initialState: UserState = {
    activeUser: {id: "-1", name: "name", position: {x: 0, y: 0, range: 0.2}},
    otherUsers: {},
};

export const userProportion = 100
export const maxRange = 300

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        move: (state, action: PayloadAction<{ id: string, position: UserCoordinates }>) => {

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
        gotRemoteStream: (state, action: PayloadAction<string>) => {
            if (state.activeUser.id === action.payload)
                state.activeUser.userStream = true
            else
                state.otherUsers[action.payload].userStream = true
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.activeUser.id = action.payload
            state.activeUser.inProximity = true
        },
        setName: (state, action: PayloadAction<string>) => {
            state.activeUser.name = action.payload
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.otherUsers[action.payload.id] = {...action.payload, name: ""}
        },
        addUser: (state, action: PayloadAction<any>) => {
            state.otherUsers[action.payload.id] = {id: action.payload.id, position: action.payload.position, name: ""}
        },
        removeUser: (state, action: PayloadAction<string>) => {
            delete state.otherUsers[action.payload]
        },
        setUsers: (state, action: PayloadAction<User[]>) => {
            const otherUsers: { [key: string]: User } = {}

            action.payload.forEach(u => {
                const id = u.id
                if (id === state.activeUser.id) {
                    state.activeUser.position = u.position
                } else if (u.position) {
                    otherUsers[id] = {...u, name: ""}
                }
            })
            state.otherUsers = otherUsers
            // action.payload.filter(u => u.id !== state.activeUser.id && u.name !== null).forEach(u => {
            //     state.otherUsers[u.id] = u
            // })
        },
        forgetUsers: (state) => {
            state.otherUsers = {}
        },
        setMessage: (state, action: PayloadAction<{ message: string, id: string }>) => {
            if (state.otherUsers[action.payload.id])
                state.otherUsers[action.payload.id].message = action.payload.message
            if (state.activeUser.id === action.payload.id)
                state.activeUser.message = action.payload.message
        },
        destroyMessage: (state, action: PayloadAction<string>) => {
            if (state.otherUsers[action.payload])
                state.otherUsers[action.payload].message = undefined
            if (state.activeUser.id === action.payload)
                state.activeUser.message = undefined
        }
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
    setUserId,
    setMessage,
    destroyMessage,
    forgetUsers
} = userSlice.actions;

export const submitMovement = (coordinates: UserCoordinates): AppThunk => (dispatch, getState) => {
    const user = getState().userState.activeUser
    if (user.position !== coordinates) {
        dispatch(sendPosition(coordinates))
        dispatch(handlePositionUpdate({id: user.id, position: coordinates}))
    }
}

export const handleMessage = (message: string, fromId: string): AppThunk => (dispatch, getState) => {
    const user = getUserById(getState(), fromId)
    if (user) {
        dispatch(setMessage({message, id: fromId}))
        setTimeout(() => dispatch(destroyMessage(fromId)), 5000)
    }
}

export const handlePositionUpdate = (object: { id: string, position: UserCoordinates }): AppThunk => (dispatch, getState) => {
    dispatch(move(object))
    const user = getState().userState.activeUser
    const currentRange = maxRange * user.position.range / 100

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
            // console.log(user.id, "in Range - sending audio to", u.id)
            dispatch(setUser({...u, inProximity: true}))
            if (user.id !== u.id)
                dispatch(sendAudio(u.id))
        } else if (dist > (currentRange + userProportion / 2) && (!!u.inProximity || u.inProximity === undefined)) {
            // console.log(user.id, "not in Range - dont send audio", u.id)
            dispatch(setUser({...u, inProximity: false}))
            if (user.id !== u.id)
                dispatch(unsendAudio(u.id))
        }
    })
}

export const submitRadius = (radius: number): AppThunk => (dispatch, getState) => {
    dispatch(changeRadius(radius))
    const position = getUser(getState()).position
    dispatch(sendPosition(position))
    dispatch(handlePositionUpdate({id: getUserID(getState()), position}))
};


export const submitNameChange = (name: string): AppThunk => dispatch => {
    dispatch(setName(name))
};

export const getUser = (state: RootState) => state.userState.activeUser;
export const getUserID = (state: RootState) => state.userState.activeUser.id;
export const getUserById = (state: RootState, id: string) => {
    if (state.userState.activeUser.id === id)
        return state.userState.activeUser
    return state.userState.otherUsers[id];
}
export const getUsers = (state: RootState) => Object.keys(state.userState.otherUsers).map(
    id => state.userState.otherUsers[id]
);

export default userSlice.reducer;
