import {RootState} from "../utils/store";
import {getDoNotDisturb, getMedia, getScreenStream, getStream, setMedia} from "../mediaSlice";
import {MediaType, User, UserCoordinates} from "./model";
import {getUserID, move, setMessage} from "../userSlice";

export class UserWrapper implements User {

    public id: string
    public static getState: () => RootState
    public static dispatch: any

    public constructor(user: User) {
        this.id = user.id
    }

    public get user(): User {
        if (this.isActiveUser())
            return UserWrapper.getState().userState.activeUser
        return UserWrapper.getState().userState.spaceUsers[this.id]
    }

    public get stream(): MediaStream | undefined {
        return getStream(UserWrapper.getState(), this.id)
    }

    public getScreenStream(): MediaStream | undefined {
        return getScreenStream(UserWrapper.getState(), this.id)
    }

    public isActiveUser(): boolean {
        return getUserID(UserWrapper.getState()) === this.id
    }

    public get anyStreamAvailable(): boolean {
        return !!this.userStream.video || !!this.userStream.audio || !!this.userStream.screen
    }

    public get online(): boolean {
        return this.user.online
    }

    public get firstName(): string | undefined {
        return this.user.firstName
    }

    public get lastName(): string | undefined {
        return this.user.lastName
    }

    public get username(): string | undefined {
        return this.user.username
    }

    public get email(): string | undefined {
        return this.user.email
    }

    public get profile_image(): string | undefined {
        // The actual URL to the image if available
        return this.user.profile_image
    }

    public get video(): boolean {
        return !!getMedia(UserWrapper.getState(), MediaType.VIDEO, this.id)
    }

    public get screen(): boolean {
        return !!getMedia(UserWrapper.getState(), MediaType.SCREEN, this.id)
        //return !!UserWrapper.getState().rtc.video[this.id]
    }

    public get audio(): boolean {
        return !!getMedia(UserWrapper.getState(), MediaType.AUDIO, this.id)
        //return !!UserWrapper.getState().rtc.audio[this.id]
    }

    public get doNotDisturb(): boolean {
        return !!getDoNotDisturb(UserWrapper.getState(), this.id)
        //return !!UserWrapper.getState().rtc.audio[this.id]
    }

    public set video(b: boolean) {
        UserWrapper.dispatch(setMedia({ id: this.id, type: MediaType.VIDEO, state: b}))
    }

    public set doNotDisturb(b: boolean) {
        UserWrapper.dispatch(setMedia({ id: this.id, type: MediaType.VIDEO, state: b}))
    }

    public set audio(b: boolean) {
        UserWrapper.dispatch(setMedia({ id: this.id, type: MediaType.AUDIO, state: b}))
    }

    public get message(): string {
        return this.user.message ?? ""
    }

    public set message(m: string) {
        UserWrapper.dispatch(setMessage({ id: this.id, message: m }))
    }

    public get inProximity(): boolean {
        return !!UserWrapper.getState().userState.inProximity[this.id]
    }

    public get inRange(): boolean {
        return !!UserWrapper.getState().userState.inRange[this.id]
    }

    public get userStream(): Record<MediaType, string | undefined> {
        return UserWrapper.getState().media.userStream[this.id] ?? {}
    }

    public get position(): UserCoordinates {
        return this.user.position ?? { x: 0, y: 0, range: 30 }
    }

    public set position(p: UserCoordinates) {
        UserWrapper.dispatch(move({id: this.id, position: p}))
    }
}
