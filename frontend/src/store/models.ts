export interface User {
    id: number
    name: string
    position: UserCoordinates
    userStream?: boolean
}
export interface UserCoordinates {
    x: number
    y: number
    range: number
}