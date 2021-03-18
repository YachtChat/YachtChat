export interface User {
    name: string
    coordinate: UserCoordinates
    radius: number
    userStream?: any
}
export interface UserCoordinates {
    x: number
    y: number
}