export interface User {
    id: string
    online: boolean

    firstName?: string
    lastName?: string
    username?: string
    email?: string
    profile_image?: string // The actual URL to the image if available

    message?: string
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
    doNotDisturb: boolean
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
    largeSpace: boolean
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

export enum StatusType {
    error = "error",
    success = "success"
}

export interface StatusMessage {
    type: string
    id: number
    message: string
}