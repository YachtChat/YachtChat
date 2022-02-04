import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './utils/store';
import {MediaType, Message, Point, User, UserCoordinates, UserPayload} from "./model/model";
import {send, sendPosition} from "./webSocketSlice";
import {getMedia, setDoNotDisturb, setMedia} from "./mediaSlice";
import {getHeaders, getToken} from "./authSlice";
import axios from "axios";
import {ACCOUNT_URL, complete_spaces_url} from "./utils/config";
import {keycloakUserToUser, playNotificationSound} from "./utils/utils";
import {handleError, handleSuccess} from "./statusSlice";
import {identifyUser} from "./utils/posthog";
import {getNextValidPostion, isPostionValid} from "./utils/positionUtils";
import {UserWrapper} from "./model/UserWrapper";
import {handleRTCEvents, sendAudio, sendVideo, unsendAudio, unsendVideo} from "./rtc";
import {sendNotification} from "./utils/notifications";
import {spaceSetupReady} from "./spaceSlice";

interface UserState {
    activeUser: User
    spaceUsers: { [key: string]: User },
    inRange: { [key: string]: boolean },
    inProximity: { [key: string]: boolean },
    messages: Message[]
}

const initialState: UserState = {
    activeUser: {
        id: "-1",
        online: true,
    },
    spaceUsers: {},
    inRange: {},
    inProximity: {},
    messages: []
};

const messageTimeout: { [fromId: string]: number } = {}

export const userProportion = 100
export const maxRange = 500

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
        setUserId: (state, action: PayloadAction<string>) => {
            state.activeUser.id = action.payload
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
                    state.activeUser = {
                        ...u,
                        position: state.activeUser.position ?? u.position,
                    }
                } else if (u.position || !u.online) {
                    spaceUsers[id] = u
                }
            })
            state.spaceUsers = spaceUsers
        },
        resetUsers: (state) => {
            state.spaceUsers = {}
            state.messages = []
            state.inRange = {}
            state.activeUser.position = undefined
        },
        setMessage: (state, action: PayloadAction<{ message: string, id: string }>) => {
            if (state.spaceUsers[action.payload.id])
                state.spaceUsers[action.payload.id].message = action.payload.message
            if (state.activeUser.id === action.payload.id)
                state.activeUser.message = action.payload.message
            const date = new Date();
            state.messages.push({
                message: action.payload.message,
                user: action.payload.id,
                time: `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}`
            })

        },
        destroyMessage: (state, action: PayloadAction<string>) => {
            if (state.spaceUsers[action.payload])
                state.spaceUsers[action.payload].message = undefined
            if (state.activeUser.id === action.payload)
                state.activeUser.message = undefined
        },
        setInRange: (state, action: PayloadAction<{ id: string, event: boolean }>) => {
            if (state.spaceUsers[action.payload.id])
                state.inRange[action.payload.id] = action.payload.event
            if (state.activeUser.id === action.payload.id)
                state.inRange[action.payload.id] = action.payload.event
        },
        setInProximity: (state, action: PayloadAction<{ id: string, event: boolean }>) => {
            if (state.spaceUsers[action.payload.id])
                state.inProximity[action.payload.id] = action.payload.event
            if (state.activeUser.id === action.payload.id)
                state.inProximity[action.payload.id] = action.payload.event
        },
    },
});

export const {
    move,
    changeRadius,
    initUser,
    setUser,
    setUsers,
    setUserOffline,
    removeUser,
    setUserId,
    setMessage,
    destroyMessage,
    resetUsers,
    setInRange,
    setInProximity
} = userSlice.actions;

// Called on initial login to retrieve the user information for all users
export const handleSpaceUsers = (spaceId: string, users: Set<UserPayload>): AppThunk => (dispatch, getState) => {
    // const userIDs: string[] = users.map(u => u.id)
    const userIds: Set<string> = new Set<string>()
    users.forEach(user => userIds.add(user.id))

    getHeaders(getState()).then(headers =>
        // load user ids from all users in space
        axios.get(complete_spaces_url + "/api/v1/spaces/" + spaceId + "/allUsers/", headers).then((response) =>
            response.data.forEach((u: { id: string }) => {
                userIds.add(u.id)
            })
        ).finally(() => {
            // axios load user info from all users in userids
            axios.post("https://" + ACCOUNT_URL + "/account/userslist/", Array.from(userIds), headers).then(response => {
                // transform into users with util-function
                const userObjects = response.data.map((user: any) => {
                    let userPayload: UserPayload | undefined
                    users.forEach(u => {
                        if (u.id === user.id) userPayload = u
                    })
                    // if the user is in the Space userPayload will be set otherwise it will not
                    if (userPayload) {
                        dispatch(setMedia({id: userPayload.id, state: userPayload.media.audio, type: MediaType.AUDIO}))
                        dispatch(setMedia({id: userPayload.id, state: userPayload.media.video, type: MediaType.VIDEO}))
                        dispatch(setMedia({id: userPayload.id, state: userPayload.media.screen, type: MediaType.SCREEN}))
                        dispatch(setDoNotDisturb({id: userPayload.id, state: userPayload.doNotDisturb,}))
                    }
                    return keycloakUserToUser(user, !!userPayload, userPayload?.position)
                })
                // finally call set users with user list
                dispatch(setUsers(userObjects))
                dispatch(spaceSetupReady(spaceId))
            })
        })
    )
    // TODO Place call for API everytime after new user joint or after interval to filter user wich are not part of space anymore
}

export const handleLoginUser = (): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(headers =>
        axios.get("https://" + ACCOUNT_URL + "/account/", headers).then(response => {
            const pre_user = getUser(getState())
            const user = keycloakUserToUser(response.data, true, pre_user.position)
            // Posthog identify
            identifyUser(user)
            dispatch(initUser(user))
            dispatch(setMedia({
                id: response.data.id,
                type: MediaType.AUDIO,
                state: getMedia(getState(), MediaType.AUDIO, pre_user.id)
            }))
            dispatch(setMedia({
                id: response.data.id,
                type: MediaType.VIDEO,
                state: getMedia(getState(), MediaType.VIDEO, pre_user.id)
            }))
        })
    )
}

// called when new user joins / including the activeUser in order to get user information for the user
export const handleSpaceUser = (userId: string, position: UserCoordinates, video: boolean, audio: boolean,
                                isCaller?: boolean): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(headers =>
        // axios load user info
        axios.get("https://" + ACCOUNT_URL + "/account/" + userId + "/", headers).then(response => {
            dispatch(setUser(keycloakUserToUser(response.data, true, position)))
            dispatch(setMedia({id: userId, type: MediaType.VIDEO, state: video}))
            dispatch(setMedia({id: userId, type: MediaType.AUDIO, state: audio}))
            // if the user.id is ourselves skip the next steps
            if (getUserID(getState()) !== userId) {
                // isCaller is true if this is a reconncetion and the local user was the previous caller
                // if isCaller is undefined it can be treated as false
                dispatch(handleRTCEvents(userId, !!isCaller))
                dispatch(handlePositionUpdate({id: userId, position: position}))
            }
        })
    )
}

// When the user moves to send the position to the other users
export const submitMovement = (coordinates: UserCoordinates, dragActivated: boolean): AppThunk => (dispatch, getState) => {
    const user = getUser(getState())

    // if the user drag is not activated we should check whether the move is valid and if not we change it
    if (!dragActivated) {
        // get user position as Point and other users position as Point array
        let userPositions: Point[] = []
        getOnlineUsers(getState()).forEach(u => {
            if (u.position) userPositions.push({x: u.position.x, y: u.position.y})
        });
        let point: Point = {x: coordinates.x, y: coordinates.y}

        // check if the position is valid and if not change it
        let possiblePoint: Point = {x: 0, y: 0}
        if (!isPostionValid(point, userPositions)) {
            possiblePoint = getNextValidPostion(point, userPositions)
            coordinates = {x: possiblePoint.x, y: possiblePoint.y, range: coordinates.range}
        }
    }

    if (user.position !== coordinates) {
        // Position will be send over Websocket
        dispatch(sendPosition(coordinates))
        // Execute proximity check
        dispatch(handlePositionUpdate({id: user.id, position: coordinates}))
    }
}

export const kickUser = (id: string, spaceID: string): AppThunk => (dispatch, getState) => {
    const state = getState()
    getHeaders(state).then(headers => {
        axios.delete(complete_spaces_url + "/api/v1/spaces/" + spaceID + "/members/?memberId=" + id, headers).then(() => {
            if (getUserById(state, id).online)
                getToken(state).then(token => {
                    dispatch(send({type: "kick", token, user_id: id}))
                })
            else {
                dispatch(removeUser(id))
                dispatch(handleSuccess("User was successfully removed"))
            }
        }).catch(() =>
            dispatch(handleError("Not able to remove user"))
        )
    })
}

// When a user sends a message
export const handleMessage = (message: string, fromId: string): AppThunk => (dispatch, getState) => {
    const state = getState()
    const isActiveUser = (getUserID(state) === fromId)
    const user = getUserById(state, fromId)
    if (user) {
        if (!isActiveUser)
            playNotificationSound()
        // Set message in order to display it
        dispatch(setMessage({message, id: fromId}))

        if (state.playground.inBackground)
            sendNotification(state, user.firstName + ": " + message, user.profile_image)

        // After timeout message will be deleted
        if (messageTimeout[fromId]) clearTimeout(messageTimeout[fromId])
        messageTimeout[fromId] = window.setTimeout(() => dispatch(destroyMessage(fromId)), 6000)
    }
}

// Is called everytime a range or position changes in order to calculate distances and trigger the right rtc events
export const handlePositionUpdate = (object: { id: string, position: UserCoordinates }): AppThunk => (dispatch, getState) => {
    // Set user position
    dispatch(move(object))

    // Get range of user
    const user = getUser(getState())
    const currentRange = maxRange * (user.position?.range ?? 30) / 100

    let users: UserWrapper[] = []

    //  If moving user is activeUser the proximity has to be compared to every user
    //  Else: The moving user has only to be compared to the active user
    if (user.id === object.id)
        users = getOnlineUsersWrapped(getState())
    else
        users.push(getUserByIdWrapped(getState(), object.id))

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
            dispatch(setInProximity({ id: u.id, event: true }))
            if (user.id !== u.id) {
                if (getUserWrapped(getState()).screen) {
                    dispatch(sendVideo(u.id))
                }
                dispatch(sendAudio(u.id))
                dispatch(send({
                    type: "range",
                    target_id: u.id,
                    event: true
                }))
            }
        } else if (dist > (currentRange + userProportion / 2) && u.inProximity || u.inProximity === undefined) {
            // console.log(user.id, "not in Range - dont send audio", u.id)
            dispatch(setInProximity({ id: u.id, event: false }))
            if (user.id !== u.id) {
                dispatch(send({
                    type: "range",
                    target_id: u.id,
                    event: false
                }))
                dispatch(unsendAudio(u.id))
                if (new UserWrapper(user).screen)
                    dispatch(unsendVideo(u.id))
            }
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

export const getUserMessages = (state: RootState, id: string) => state.userState.messages.filter(m => m.user === id);
export const getUser = (state: RootState): User => state.userState.activeUser
export const getUserWrapped = (state: RootState): UserWrapper => new UserWrapper(getUser(state))
export const getUserID = (state: RootState) => state.userState.activeUser.id;
export const getUserById = (state: RootState, id: string): User => {
    if (getUserID(state) === id)
        return getUser(state)
    return state.userState.spaceUsers[id]
}
export const getUserByIdWrapped = (state: RootState, id: string) => new UserWrapper(getUserById(state, id))
export const getUsers = (state: RootState) => Object.keys(state.userState.spaceUsers).map(
    id => getUserById(state, id)
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
export const getOnlineUsersWrapped = (state: RootState) => getOnlineUsers(state).map(u => new UserWrapper(u));
export default userSlice.reducer;
