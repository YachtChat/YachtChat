export interface User {
    id: string
    online: boolean

    firstName?: string
    lastName?: string
    username?: string
    email?: string
    profile_image?: string // The actual URL to the image if available

    message?: string
    inProximity?: boolean // if in my proximity
    inRange?: boolean // if in their proximity
    userStream: Record<MediaType, string | undefined>
    position?: UserCoordinates
}

// What the websocket sends to the Frontend
export interface UserPayload {
    id: string
    position?: UserCoordinates,
    media: {
        video: boolean,
        audio: boolean,
        screen: boolean
    }
}

export interface Message {
    message: string,
    user: string,
    time: string
}


export interface UserCoordinates {
    x: number
    y: number
    range: number
}

export interface PlaygroundOffset {
    x: number
    y: number
    scale: number
    trueScale: number
}

export interface Space {
    name: string
    id: string
    public: boolean
    online?: number // number of users online
    hosts: string[]
}

export interface Point {
    x: number
    y: number
}

export enum MediaType {
    AUDIO = "audio",
    VIDEO = "video",
    SCREEN = "screen"
}

export enum CameraMode {
    Manual,
    Automatically
}