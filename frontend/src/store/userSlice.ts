import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {MediaType, User, UserCoordinates, UserPayload} from "./models";
import {send, sendPosition, userSetupReady} from "./webSocketSlice";
import {handleRTCEvents, sendAudio, unsendAudio} from "./rtcSlice";
import {getHeaders, getToken} from "./authSlice";
import axios from "axios";
import {ACCOUNT_URL, SPACES_URL} from "./config";
import {keycloakUserToUser} from "./utils";

interface UserState {
    activeUser: User
    spaceUsers: { [key: string]: User },
}

const initialState: UserState = {
    activeUser: {id: "-1", online: true},
    spaceUsers: {},
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
            if (state.activeUser.id === action.payload) {
                state.activeUser.userStream = true
                state.activeUser.inProximity = true
            } else
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
                } else if (u.position || !u.online) {
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

// Called on initial login to retrieve the user information for all users
export const handleSpaceUsers = (spaceId: string, users: UserPayload[]): AppThunk => (dispatch, getState) => {
    const userIDs: string[] = users.map(u => u.id)
    getHeaders(getState()).then(headers =>
        // load user ids from all users in space
        axios.get("https://" + SPACES_URL + "/api/v1/spaces/" + spaceId + "/allUsers/", headers).then((response) =>
            response.data.forEach((u: { id: string }) => {
                userIDs.push(u.id)
            })
        ).finally(() => {
            // axios load user info from all users in userids
            axios.post("https://" + ACCOUNT_URL + "/account/userslist/", userIDs, headers).then(response => {
                // transform into users with util-function
                const userObjects = response.data.map((user: any) => {
                    const userPayload = users.find(u => u.id === user.id)
                    // set all users online and position of users in "users" (maybe also image)
                    return keycloakUserToUser(user, !!userPayload, userPayload?.position)
                })
                console.log(userObjects)
                // finally call set users with user list
                dispatch(setUsers(userObjects))
                dispatch(userSetupReady())
            })
        })
    )
    // TODO Place call for API everytime after new user joint or after interval to filter user wich are not part of space anymore
}

export const handleLoginUser = (user: UserPayload): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(headers =>
        axios.get("https://" + ACCOUNT_URL + "/account/", headers).then(response => {
            const user = keycloakUserToUser(response.data, true)
            console.log("ActiveUser", user)
            dispatch(initUser(user))
        })
    )
}

// called when new user joins / including the activeUser in order to get user information for the user
export const handleSpaceUser = (user: UserPayload, isActiveUser?: boolean): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(headers =>
        // axios load user info
        axios.get("https://" + ACCOUNT_URL + "/account/" + user.id + "/", headers).then(response => {
            // transform into user with util-function
            // finally set user
            if (isActiveUser) {
                const user = keycloakUserToUser(response.data, true)
                console.log("ActiveUser", user)
                dispatch(initUser(user))
            } else {
                dispatch(setUser(keycloakUserToUser(response.data, true, user?.position)))
                // If the user is not the active user, init RTC Events
                if (getUser(getState()).id !== user.id) {
                    // TODO here the new_user case is treated exactly the same as the login case, however , there should
                    // be a callee and a caller.
                    dispatch(handleRTCEvents(user.id));
                    dispatch(handlePositionUpdate({id: user.id, position: user.position!}))
                }
            }
        })
    )
}

// When the user moves to send the position to the other users
export const submitMovement = (coordinates: UserCoordinates): AppThunk => (dispatch, getState) => {
    const user = getUser(getState())
    if (user.position !== coordinates) {
        // Position will be send over Websocket
        dispatch(sendPosition(coordinates))
        // Execute proximity check
        dispatch(handlePositionUpdate({id: user.id, position: coordinates}))
    }
}

export const kickUser = (id: string): AppThunk => (dispatch, getState) => {
    getToken(getState()).then(token => {
        dispatch(send({type: "kick", token, user_id: id}))
    })
}

// When a user sends a message
export const handleMessage = (message: string, fromId: string): AppThunk => (dispatch, getState) => {
    const user = getUserById(getState(), fromId)
    if (user) {
        // Set message in order to display it
        dispatch(setMessage({message, id: fromId}))
        // After timeout message will be deleted
        setTimeout(() => dispatch(destroyMessage(fromId)), 12000)
    }
}

// Is called everytime a range or position changes in order to calculate distances and trigger the right rtc events
export const handlePositionUpdate = (object: { id: string, position: UserCoordinates }): AppThunk => (dispatch, getState) => {
    // Set user position
    dispatch(move(object))

    // Get range of user
    const user = getUser(getState())
    const currentRange = maxRange * user.position!.range / 100

    let users: User[] = []

    //  If moving user is activeUser the proximity has to be compared to every user
    //  Else: The moving user has only to be compared to the active user
    if (user.id === object.id)
        users = getOnlineUsers(getState())
    else
        users.push(getUserById(getState(), object.id))

    // if (getUser(getState()).position === user.position)
    users.forEach(u => {
        if (!u || !u.position)
            return
        // Calculate the euclidean distance
        const dist = Math.sqrt(
            Math.pow(((u.position.x) - (user.position!.x)), 2) +
            Math.pow(((u.position.y) - (user.position!.y)), 2)
        )
        // If the user is not marked as in proximity, but actually is, set flag and send audio
        // Else: If the user is marked as in proximity, but actually is not, reset flag and unsend audio
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

// Sends the radius to the other users and triggers the distance routine
export const submitRadius = (radius: number): AppThunk => (dispatch, getState) => {
    // Sets the radius
    dispatch(changeRadius(radius))

    // Sends the radius
    const position = getUser(getState()).position!
    dispatch(sendPosition(position))

    // Dispatches distance calculation update
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
).sort((a, b) => {
    // Order by last name
    const nameA = a.lastName + ", " + a.firstName
    const nameB = b.lastName + ", " + b.firstName
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
});
export const getOnlineUsers = (state: RootState) => getUsers(state).filter(u => u.online);
export const getFriends = (state: RootState) => [];

export default userSlice.reducer;
