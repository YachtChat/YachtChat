import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {MediaType, User, UserCoordinates, UserPayload} from "./models";
import {sendPosition} from "./webSocketSlice";
import {sendAudio, unsendAudio} from "./rtcSlice";
import {getHeaders} from "./authSlice";
import axios from "axios";
import {ACCOUNT_URL, SPACES_URL} from "./config";
import {keycloakUserToUser} from "./utils";

interface UserState {
    activeUser: User
    spaceUsers: { [key: string]: User },
    friends: { [key: string]: User }
}

const initialState: UserState = {
    activeUser: {id: "-1", online: true},
    spaceUsers: {},
    friends: {}
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
            if (!state.spaceUsers[action.payload.id])
                return
            state.spaceUsers[action.payload.id].position = action.payload.position
        },
        changeRadius: (state, action: PayloadAction<number>) => {
            state.activeUser.position!.range = action.payload;
        },
        gotRemoteStream: (state, action: PayloadAction<string>) => {
            if (state.activeUser.id === action.payload)
                state.activeUser.userStream = true
            else
                state.spaceUsers[action.payload].userStream = true
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.activeUser.id = action.payload
            state.activeUser.inProximity = true
        },
        initUser: (state, action: PayloadAction<User>) => {
            state.activeUser = action.payload
        },
        setUser: (state, action: PayloadAction<User>) => {
            if (action.payload.id === state.activeUser.id) {
                state.activeUser = action.payload
            } else {
                state.spaceUsers[action.payload.id] = action.payload
            }
        },
        setUserOffline: (state, action: PayloadAction<string>) => {
            state.spaceUsers[action.payload].online = false
        },
        removeUser: (state, action: PayloadAction<string>) => {
            delete state.spaceUsers[action.payload]
        },
        setUsers: (state, action: PayloadAction<User[]>) => {
            const spaceUsers: { [key: string]: User } = {}

            // create a map out of users
            action.payload.forEach(u => {
                const id = u.id
                if (id === state.activeUser.id) {
                    state.activeUser = u
                } else if (u.position) {
                    spaceUsers[id] = u
                }
            })
            state.spaceUsers = spaceUsers
        },
        forgetUsers: (state) => {
            state.spaceUsers = {}
        },
        setMessage: (state, action: PayloadAction<{ message: string, id: string }>) => {
            if (state.spaceUsers[action.payload.id])
                state.spaceUsers[action.payload.id].message = action.payload.message
            if (state.activeUser.id === action.payload.id)
                state.activeUser.message = action.payload.message
        },
        destroyMessage: (state, action: PayloadAction<string>) => {
            if (state.spaceUsers[action.payload])
                state.spaceUsers[action.payload].message = undefined
            if (state.activeUser.id === action.payload)
                state.activeUser.message = undefined
        },
        setMedia: (state, action: PayloadAction<{ id: string, type: MediaType, state: boolean }>) => {
            if (action.payload.id === state.activeUser.id) {
                state.activeUser.image = action.payload.state
                return
            }
            if (state.spaceUsers[action.payload.id])
                state.spaceUsers[action.payload.id].image = action.payload.state
        }
    },
});

export const {
    move,
    changeRadius,
    gotRemoteStream,
    initUser,
    setUser,
    setUsers,
    setUserOffline,
    removeUser,
    setUserId,
    setMessage,
    destroyMessage,
    forgetUsers,
    setMedia
} = userSlice.actions;

export const handleSpaceUsers = (spaceId: string, users: UserPayload[]): AppThunk => (dispatch, getState) => {
    const userIDs: string[] = users.map(u => u.id)
    getHeaders(getState()).then(headers =>
        // load user ids from all users in space
        axios.get("https://" + SPACES_URL + "/api/v1/spaces/" + spaceId + "/allUsers/", headers).then((response) =>
            response.data.forEach((u: { id: string }) =>
                userIDs.push(u.id)
            )
        ).finally(() => {
            console.log(userIDs)
            // axios load user info from all users in userids
            axios.get("https://" + ACCOUNT_URL + "/account/userslist", {...headers, data: userIDs}).then(response => {
                // transform into users with util-function
                const userObjects = response.data.map((user: any) => {
                    const userPayload = users.find(u => u.id === user.id)
                    // set all users online and position of users in "users" (maybe also image)
                    return keycloakUserToUser(user, !!userPayload, userPayload?.position)
                })
                // finally call set users with user list
                dispatch(setUsers(userObjects))
            })
        })
    )
}

// when new user joins
export const handleSpaceUser = (user: UserPayload, isActiveUser?: boolean): AppThunk => (dispatch, getState) => {
    console.log("Hello")
    getHeaders(getState()).then(headers =>
        // axios load user info
        axios.get("https://" + ACCOUNT_URL + "/account/" + user.id, headers).then(response => {
            console.log(headers)
            console.log(response)
            // transform into user with util-function
            // finally set user
            if (isActiveUser) {
                dispatch(initUser(keycloakUserToUser(user, true)))
            } else {
                dispatch(setUser(keycloakUserToUser(user, true, user?.position)))
            }
        })
    )
}

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
    const currentRange = maxRange * user.position!.range / 100

    let users: User[] = []

    if (user.id === object.id)
        users = getUsers(getState())
    else
        users.push(getUserById(getState(), object.id))

    // if (getUser(getState()).position === user.position)
    users.forEach(u => {
        if (!u.position)
            return
        const dist = Math.sqrt(
            Math.pow(((u.position.x) - (user.position!.x)), 2) +
            Math.pow(((u.position.y) - (user.position!.y)), 2)
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
    const position = getUser(getState()).position!
    dispatch(sendPosition(position))
    dispatch(handlePositionUpdate({id: getUserID(getState()), position}))
};

export const requestFriends = (): AppThunk => dispatch => {
    // request and commit friends here
}

export const getUser = (state: RootState) => state.userState.activeUser;
export const getUserID = (state: RootState) => state.userState.activeUser.id;
export const getUserById = (state: RootState, id: string) => {
    if (state.userState.activeUser.id === id)
        return state.userState.activeUser
    return state.userState.spaceUsers[id];
}
export const getUsers = (state: RootState) => Object.keys(state.userState.spaceUsers).map(
    id => state.userState.spaceUsers[id]
);
export const getFriends = (state: RootState) => Object.keys(state.userState.spaceUsers).map(
    id => state.userState.friends[id]
);

export default userSlice.reducer;
