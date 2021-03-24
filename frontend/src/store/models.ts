export interface User {
    id: number
    name: string
    position: UserCoordinates
    userStream?: boolean
    inProximity?: boolean
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