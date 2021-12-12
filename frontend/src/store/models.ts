export interface User {
    id: string
    online: boolean

    firstName?: string
    lastName?: string
    username?: string
    email?: string
    profile_image?: string // The actual URL to the image if available

    video?: boolean // if a user sends video or not
    message?: string
    inProximity?: boolean
    userStream?: boolean
    position?: UserCoordinates
}

// What the websocket sends to the Frontend
export interface UserPayload {
    id: string
    position?: UserCoordinates
    video?: boolean
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
    hosts: string[]
}
export interface Point {
    x: number
    y: number
}

export enum MediaType {
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    SCREEN = "SCREEN"
}