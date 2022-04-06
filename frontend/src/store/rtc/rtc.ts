
import * as P2P from "./p2p";
import * as SFU from "./sfu"
import {AppThunk, RootState} from "../utils/store";
import {MediaType} from "../model/model";
import {getUser, getUserById, getUserID, getUserWrapped, handlePositionUpdate, setUserOffline} from "../userSlice";
import {resetMedia} from "../mediaSlice";
import {sendNotification} from "../utils/notifications";

let IS_STATE_SFU: boolean | undefined = undefined

// is either called if the local user joins the space or a new user joins the space
// should send its own stream to the users of the space. When other users joins the space, their tracks will be forwarded
// to setStream(.
export const join = (joinedUserId: string, isCaller?: boolean): AppThunk =>(dispatch, getState) => {
    let spaceId = window.location.pathname.replace("/spaces/", "")
    IS_STATE_SFU = getState().space.spaces.filter(space => space.id === spaceId)[0].largeSpace;
    if(IS_STATE_SFU){
        if(isCaller == undefined){
            dispatch(SFU.handleSpaceJoin(joinedUserId, undefined, window.location.pathname.replace("/spaces/", "")))
        }else{
        //    we do nothing here
        }

    }else{
        console.log("join called")
        dispatch(P2P.handleRTCEvents(joinedUserId, isCaller))
    }
}

export const activateAudioTo = (id: string): AppThunk => (dispatch, getState) => {
    if (!getUserWrapped(getState()).audio)
        return

    if(IS_STATE_SFU){
        SFU.updateMediaToId(id, undefined, true)
    }else{
        dispatch(P2P.sendAudio(id))
    }
    // this shouldn't be here
    const user = getUserById(getState(), id)
    if (getState().playground.inBackground){
        if (getState().media.screen[getUserID(getState())])
            sendNotification(getState(), `${user.firstName} can hear you and see your screen`, user.profile_image,)
        else
            sendNotification(getState(), `${user.firstName} can hear you`, user.profile_image,
            )
    }
}

export const deactivateAudioTo = (id: string):AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        SFU.updateMediaToId(id, undefined, false)
    }else{
        dispatch(P2P.unsendAudio(id))
    }
}

export const activateVideoTo = (id: string): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        SFU.updateMediaToId(id, true, undefined)
    }else{
        dispatch(P2P.sendVideo(id))
    }
}
export const deactivateVideoTo = (id: string): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        SFU.updateMediaToId(id, false, undefined)
    }else{
        dispatch(P2P.unsendVideo(id))
    }
}


export const isSendingAudioTo = (id: string): boolean => {
    if(IS_STATE_SFU){
        return SFU.isSendingMediaTo(id, MediaType.AUDIO)
    }else{
        return P2P.localUserIsSendingAudioTo(id)
    }
}

export const forwardSdp = (description: any, fromId: string): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        throw new Error("Cannot handle SDP in SFU mode")
    }else{
        dispatch(P2P.handleSdp(description, fromId))
    }
}

export const forwardCandidate = (candidate: any, fromId: string): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        throw new Error("Cannot handle SDP in SFU mode")
    }else{
        dispatch(P2P.handleCandidate(candidate, fromId))
    }
}

// should only be called when the user has joined the space only with microphone and want to add video now
export const addTrackToStream = (streamTrack: MediaStreamTrack): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        SFU.addTrackToStream(streamTrack)
    }else{
        dispatch(P2P.addTracks(streamTrack))
    }
}

export const exchangeStreamTracks = (stream: MediaStream | undefined, video: boolean, audio: boolean): AppThunk => (dispatch, getState) => {
    if(IS_STATE_SFU){
        dispatch(SFU.exchangeTracks(stream!, video, audio))
    }else{
        dispatch(P2P.exchangeTracks(stream, video, audio))
    }
}

export const disconnectUser = (id: string): AppThunk => (dispatch, getState) => {
    if (IS_STATE_SFU) {
        SFU.disconnectUser(id)
    } else {
        dispatch(P2P.disconnectUser(id))
    }
    // calls that are not specific for either P2P or SFU
    dispatch(setUserOffline(id))
    dispatch(resetMedia(id))
}

export const resetRTC = (state: RootState) => {
    if(IS_STATE_SFU){
        SFU.disconnect()
    }else{
        P2P.resetRTC(state)
    }
}
export const stopTracks = (state: RootState, media: MediaType) => {
    if(IS_STATE_SFU){
        console.log("We don't need to stop the tracks in SFU mode since we just forward the local stream")
    }else{
        P2P.stopTracks(state, media)
    }
}
