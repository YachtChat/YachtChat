export interface User {
    id: string
    name: string
    position: UserCoordinates
    image: boolean // if a user sends video or not
    userStream?: boolean
    inProximity?: boolean
    message?: string
    profilePic?: string // The actual URL to the image if available
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
}

export interface Space {
    name: string
    id: string
}

export enum MediaType {
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    SCREEN = "SCREEN"
}