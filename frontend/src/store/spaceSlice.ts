import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./model/model";
import {AppThunk, RootState} from "./utils/store";
import axios from "axios";
import {handleError, handleSuccess} from "./statusSlice";
import {complete_spaces_url, SOCKET_PORT, SOCKET_URL, SPACES_URL} from "./utils/config";
import {getHeaders} from "./authSlice";
import {push} from "connected-react-router";
import {getUser, getUserID, submitMovement} from "./userSlice";
import {handleRTCEvents} from "./rtc";

// either the spaces server is run locally or on the server

interface SpaceState {
    spaces: Space[]
    joinedSpace: string | undefined
    inviteToken: { [spaceid: string]: string | undefined }
}

const initialState: SpaceState = {
    spaces: [],
    joinedSpace: undefined,
    inviteToken: {}
}

export const spaceSlice = createSlice({
    name: "space",
    initialState,
    reducers: {
        setSpaces: (state, action: PayloadAction<Space[]>) => {
            state.spaces = action.payload.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            }).map(s => {
                return s.hosts ? s : {...s, hosts: []}
            })
        },
        addSpace: (state, action: PayloadAction<Space>) => {
            state.spaces.push(action.payload)
        },
        setHosts: (state, action: PayloadAction<{ spaceID: string, hosts: string[] }>) => {
            state.spaces.find(s => s.id === action.payload.spaceID)!.hosts = action.payload.hosts
        },
        joined: (state, action: PayloadAction<string>) => {
            state.joinedSpace = action.payload
        },
        setInviteToken: (state, action: PayloadAction<{ spaceid: string, token: string }>) => {
            state.inviteToken[action.payload.spaceid] = action.payload.token
        },
        leftSpace: (state) => {
            state.joinedSpace = undefined
            state.inviteToken = {}
        },
    }
});

export const {
    setSpaces,
    addSpace,
    setHosts,
    joined,
    leftSpace,
    setInviteToken
} = spaceSlice.actions;

export const requestSpaces = (): AppThunk => (dispatch, getState) => {
    if (!SPACES_URL) {
        dispatch(handleError("No spaces url defined for this environment"));
        return;
    }
    getHeaders(getState()).then(header =>
        axios.get(complete_spaces_url + "/api/v1/spaces/", header).then(spaceResponse => {
            const ids = spaceResponse.data.map((d: { id: string }) => d.id)
            let spaces = spaceResponse.data
            axios.post("http://" + SOCKET_URL + ":" + SOCKET_PORT + "/api/v1/space/members", ids, header).then(onlineUserResponse => {
                spaces = spaceResponse.data.map((d: Space) => {
                    getInvitationToken(getState(), d.id).then(inviteToken => dispatch(setInviteToken({spaceid: d.id, token: inviteToken})))
                    return {
                        ...d,
                        online: onlineUserResponse.data[d.id] ?? 0
                    }
                })
            }).finally(() => {
                dispatch(setSpaces(spaces))
            })
        }).catch(e => console.log(e.trace))
    )
}

export const joinSpace = (token: string): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(header =>
        axios.post(complete_spaces_url + "/api/v1/spaces/invitation", {token}, header).then(response => {
            dispatch(addSpace(response.data))
            dispatch(handleSuccess("Space successfully joined"))
            dispatch(push("/spaces/" + response.data.id))
        }).catch(e => {
            dispatch(handleError("Space could not be joined", e))
            dispatch(returnHome())
        })
    )
}

export const createSpace = (name: string): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(header =>
        axios.post(complete_spaces_url + "/api/v1/spaces/", {name}, header).then(response => {
            dispatch(handleSuccess("Space successfully created"))
            dispatch(addSpace(response.data))
            dispatch(push("/invite/" + response.data.id))
            getInvitationToken(getState(), response.data.id).then(t => dispatch(setInviteToken({spaceid: response.data.id, token: t})))
        }).catch(e => {
            console.log(complete_spaces_url + "/api/v1/spaces/?name=" + name)
            dispatch(handleError("Space could not be created"))
            dispatch(push("/create-space"))
            console.log(e.trace)
        })
    )
}

export const returnHome = (): AppThunk => (dispatch) => {
    dispatch(push("/"))
}

export const deleteSpaceForUser = (spaceId: string): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(header =>
        axios.delete(complete_spaces_url + "/api/v1/spaces/" + spaceId + "/members/?memberId=" + getUserID(getState()), header).then(() => {
            dispatch(handleSuccess("Space successfully deleted"))
            dispatch(requestSpaces())
        }).catch(e => {
            dispatch(handleError("Space could not be deleted", e))
        })
    )
}

export const spaceSetupReady = (spaceID: string): AppThunk => (dispatch, getState) => {
    const user = getUser(getState())
    dispatch(handleRTCEvents(getUserID(getState())));
    dispatch(submitMovement(user.position!, false))
    dispatch(joined(spaceID))
}

export const resetSpace = (): AppThunk => (dispatch) => {
    dispatch(leftSpace())
    dispatch(requestSpaces())
}

export const getInvitationToken = (state: RootState, spaceID: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        if (getToken(state, spaceID))
            resolve(getToken(state, spaceID)!)
        getHeaders(state).then(headers => {
                console.log(headers)
                axios.get(complete_spaces_url + "/api/v1/spaces/invitation?spaceId=" + spaceID, headers).then(response => {
                    resolve(response.data)
                }).catch((e) => {
                    console.log(e.trace)
                    reject()
                })
            }
        )
    })
}

export const requestHosts = (spaceID: string): AppThunk => (dispatch, getState) => {
    // send request to backend to promote this user
    getHeaders(getState()).then(headers => {
            axios.get(complete_spaces_url + "/api/v1/spaces/" + spaceID + "/hosts/", headers).then(response => {
                dispatch(setHosts({
                    spaceID,
                    hosts: response.data.map((d: { id: string }) => d.id)
                }))
            }).catch((e) => {
                console.log(e.trace)
            })
        }
    )
}

export const promoteUser = (id: string, spaceID: string): AppThunk => (dispatch, getState) => {
    // send request to backend to promote this user
    getHeaders(getState()).then(headers => {
            axios.post(complete_spaces_url + "/api/v1/spaces/" + spaceID + "/hosts/?hostId=" + id, {}, headers).then(() => {
                dispatch(requestHosts(spaceID))
                dispatch(handleSuccess("Successfully promoted user"))
            }).catch((e) => {
                console.log(e.trace)
            })
        }
    )
}

export const downgradeUser = (id: string, spaceID: string): AppThunk => (dispatch, getState) => {
    // send request to backend to promote this user
    getHeaders(getState()).then(headers => {
            axios.delete(complete_spaces_url + "/api/v1/spaces/" + spaceID + "/hosts/?hostId=" + id, headers).then(() => {
                dispatch(requestHosts(spaceID))
                dispatch(handleSuccess("Successfully downgraded user"))
            }).catch((e) => {
                console.log(e.trace)
            })
        }
    )
}

export const isHost = (state: RootState, spaceID: string, uid: string): boolean => {
    const space = state.space.spaces.find(s => s.id === spaceID)
    if (!space) return false

    return !!space.hosts.find(h => h === uid)
}

export const getToken = (state: RootState, spaceID: string): string | undefined => {
    return state.space.inviteToken[spaceID]
}

export default spaceSlice.reducer
