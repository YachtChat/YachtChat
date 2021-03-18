export interface User {
    name: string
    coordinate: UserCoordinates
    radius: number
    userStream?: string
}
export interface UserCoordinates {
    x: number
    y: number
}