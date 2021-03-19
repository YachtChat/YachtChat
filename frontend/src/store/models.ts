export interface User {
    id: number
    name: string
    coordinate: UserCoordinates
    userStream?: string
}
export interface UserCoordinates {
    x: number
    y: number
    range: number
}