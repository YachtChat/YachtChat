import React, {Component} from "react";
import {PlaygroundOffset, User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import './style.scss';
import {getUsers, submitMovement} from "../../store/userSlice";
import {toggleUserVideo, mute} from "../../store/rtcSlice";
import UserComponent from "./UserComponent";
import RangeComponent from "./RangeComponent";
import {handleZoom, movePlayground, scalePlayground, setScale} from "../../store/playgroundSlice";
import FocusUser from "./focusUser";

interface Props {
    activeUser: User
    spaceUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
    offset: PlaygroundOffset
    changeSizeMultiplier: (size: number) => void
    movePlayground: (offset: PlaygroundOffset) => void
    handleZoom: (zoom: number, x?: number, y?: number) => void
    setScale: (zoom: number, x?: number, y?: number) => void
    toggleAudio: () => void
    toggleVideo: () => void
    video: boolean
    muted: boolean
}

interface State {
    userDragActive: boolean
    mapDragActive: boolean
    previousOffset?: { x: number, y: number }
    previousPosition?: { x: number, y: number }
    dragStart?: { x: number, y: number }
    userOffset?: { x: number, y: number }
    pinchStart?: { x1: number, y1: number, x2: number, y2: number, scale: number }
    focusUser?: string
    possibleFocusUser?: string
}

export class Canvas extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            userDragActive: false,
            mapDragActive: false,
        }
    }

    focus(userID: string) {
        if (!this.state.focusUser) {
            this.setState({
                focusUser: userID
            })
        }
    }

    handleClose(component: string) {
        if (this.state.focusUser) {
            this.setState({
                focusUser: undefined
            })
        }
    }

    touchStart(event: React.TouchEvent) {
        event.preventDefault()
        if (event.touches.length < 2) {
            // Drag
            this.dragStart(event)
        } else if (event.touches.length === 2) {
            // Pinch to zoom
            this.setState({
                pinchStart: {
                    x1: event.touches[0].clientX,
                    y1: event.touches[0].clientY,
                    x2: event.touches[1].clientX,
                    y2: event.touches[1].clientY,
                    scale: this.props.offset.trueScale
                }
            })
        }
    }

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStart(event: React.MouseEvent | React.TouchEvent) {
        event.stopPropagation()
        const activeUser = ((event.target as HTMLVideoElement).dataset.id === "activeUser")
        const message = ((event.target as HTMLDivElement).dataset.id === "message")

        const clickedUserId = ((event.target as HTMLVideoElement).dataset.id)

        const canvas = !(activeUser || message)

        let x, y;

        if (event.type === "mousedown") {
            x = (event as React.MouseEvent).clientX
            y = (event as React.MouseEvent).clientY
        } else {
            x = (event as React.TouchEvent).touches[0].clientX
            y = (event as React.TouchEvent).touches[0].clientY
        }
        let userOffsetx, userOffsety;
        userOffsetx = x / this.props.offset.scale + this.props.offset.x - this.props.activeUser.position!.x
        userOffsety = y / this.props.offset.scale + this.props.offset.y - this.props.activeUser.position!.y

        if (activeUser)
            this.setState({
                possibleFocusUser: clickedUserId,
                userDragActive: true,
                dragStart: {x, y},
                userOffset: {x: userOffsetx, y: userOffsety}
            })
        else if (canvas)
            this.setState({
                possibleFocusUser: clickedUserId,
                mapDragActive: true,
                previousOffset: this.props.offset,
                previousPosition: {
                    x: this.props.activeUser.position!.x,
                    y: this.props.activeUser.position!.y
                },
                dragStart: {x, y}
            })
    }

    onMouseUp(e: React.MouseEvent) {
        // if the user is currently in the focus user mode this.state.focusUser will not be undefined and therefore we
        // don't want to move
        if (((!this.state.dragStart ||
                    this.state.dragStart.x === e.clientX ||
                    this.state.dragStart.y === e.clientY) &&
                !(e.target as HTMLDivElement).classList.contains("MuiTooltip-tooltip"))
            && (this.state.focusUser === undefined)
        ) {
            // Open full screen of user if clicked on user
            const clickedUserId = ((e.target as HTMLVideoElement).dataset.id)
            let focused = false
            this.props.spaceUsers.forEach(user => {
                if (user.id === clickedUserId && user.inProximity) {
                    this.focus(user.id)
                    //    <FocusUser open={this.state.open["focus"]} onClose={() => this.handleClose("focus")}/>
                    focused = true
                }
            })

            // If not opened fullscreen jump to that spot
            if (!focused) {
                const scaling = this.props.offset.scale
                const x = e.currentTarget.getBoundingClientRect().x
                const y = e.currentTarget.getBoundingClientRect().y
                this.props.move({
                    x: e.clientX / scaling - x + this.props.offset.x,
                    y: e.clientY / scaling - y + this.props.offset.y,
                    range: this.props.activeUser.position!.range
                })
            }
        }
        this.dragEnd(e)
    }

    // function that sets the state of dragActive on false
    // if the mouse left the playground or is not holded anymore
    dragEnd(e: React.MouseEvent | React.TouchEvent) {
        this.setState({
            userDragActive: false,
            mapDragActive: false,
            dragStart: undefined,
            previousOffset: undefined,
            previousPosition: undefined
        })
    }

    // function that moves the active user if the mouse
    moveMouse(e: React.MouseEvent) {
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y
        const clientX = e.clientX
        const clientY = e.clientY
        this.move(x, y, clientX, clientY)
    }

    // function that moves the active user if user touches
    moveTouch(e: React.TouchEvent) {
        e.preventDefault()
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y
        const clientX = e.touches[0].clientX
        const clientY = e.touches[0].clientY
        this.move(x, y, clientX, clientY)

        // If user is pinching
        if (e.touches.length === 2) {
            const p = this.state.pinchStart!
            const t = e.touches
            const oldDistance = Math.sqrt((p.x1 - p.x2) ** 2 + (p.y1 - p.y2) ** 2)
            const newDistance = Math.sqrt((t[0].clientX - t[1].clientX) ** 2 + (t[0].clientY - t[1].clientY) ** 2)

            // compare the distances against each other
            const ratio = newDistance / oldDistance
            this.props.setScale(p.scale * ratio, (t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2)
        }
        e.preventDefault()
    }

    move(x: number, y: number, clientX: number, clientY: number) {
        const scaling = this.props.offset.scale
        if (this.state.userDragActive) {
            this.props.move({
                x: clientX / scaling + this.props.offset.x - this.state.userOffset!.x,
                y: clientY / scaling + this.props.offset.y - this.state.userOffset!.y,
                range: this.props.activeUser.position!.range
            })
        }
        if (this.state.mapDragActive) {
            const prev = this.state.previousOffset!
            const start = this.state.dragStart!
            this.props.movePlayground({
                ...this.props.offset,
                x: (prev.x + (start.x - clientX) / scaling) - x,
                y: (prev.y + (start.y - clientY) / scaling) - y
            })
            // this.props.move({
            //     x: this.state.previousPosition!.x + (start.x - e.clientX) / scaling,
            //     y: this.state.previousPosition!.y + (start.y - e.clientY) / scaling,
            //     range: this.props.activeUser.position!.range
            // })
        }
    }

    // calls handleZoomOut if user scrolls down/ handleZoomIn if user scrolls up
    onWheel(event: React.WheelEvent) {
        event.preventDefault()

        if (!event.ctrlKey)
            this.props.handleZoom(event.deltaY / 100, event.clientX, event.clientY)
        else
            this.props.handleZoom(-event.deltaY / 100, event.clientX, event.clientY)
    }

    handleKeyStream(event: React.KeyboardEvent) {
        event.preventDefault()
        if (event.key === "m") { //"m"
            this.props.toggleAudio()
        }
        if (event.key === "c") { //"c"
            this.props.toggleVideo()
        }
    }

    componentDidMount() {
        // Enable Safari pinch to zoom gesture
        window.addEventListener("gesturestart", (e: any) => {
            e.preventDefault()
            this.setState({
                pinchStart: {x1: 0, x2: 0, y1: 0, y2: 0, scale: this.props.offset.trueScale}
            })
        })
        window.addEventListener("gesturechange", (e: any) => {
            e.preventDefault();
            this.props.setScale(this.state.pinchStart!.scale * e.scale)
            e.stopPropagation()
        })

        // Disable native drag actions of browser
        document.onwheel = (e) => e.preventDefault()
        document.getElementById("Playground")?.addEventListener("wheel", (e) => e.preventDefault())
        window.addEventListener("gestureend", (e: any) => e.preventDefault())
        // window.addEventListener("touchstart", (e: any) => e.preventDefault())
        // window.addEventListener("touchmove", (e: any) => e.preventDefault())
        // window.addEventListener("touchend", (e: any) => e.preventDefault())


    }

    render() {
        const scaling = this.props.offset.scale
        const style = {
            backgroundPosition: `${-this.props.offset.x * scaling}px ${-this.props.offset.y * scaling}px`,
            backgroundSize: `${3 * scaling}rem ${3 * scaling}rem`
        }
        return (
            <div id="Playground" style={style} className="Playground"
                 onMouseMove={this.moveMouse.bind(this)}
                 onMouseLeave={this.dragEnd.bind(this)}
                 onMouseUp={this.onMouseUp.bind(this)}
                 onWheel={this.onWheel.bind(this)}
                 onKeyDown={this.handleKeyStream.bind(this)}
                 onMouseDown={this.dragStart.bind(this)}
                 onTouchStart={this.touchStart.bind(this)}
                 onTouchMove={this.moveTouch.bind(this)}
                 onTouchEnd={this.dragEnd.bind(this)}
                 tabIndex={0}>
                {this.props.spaceUsers.map(user => {
                    if (!user.online)
                        return null
                    return <RangeComponent key={user.id} isActiveUser={false}
                                           selected={false} user={user}/>
                })}
                <RangeComponent user={this.props.activeUser}
                                selected={this.state.mapDragActive || this.state.userDragActive}
                                isActiveUser={true}/>
                {this.props.spaceUsers.map(user => {
                    if (!user.online)
                        return null
                    return <UserComponent key={user.id} isActiveUser={false} selected={false} user={user}/>
                })}
                <UserComponent user={this.props.activeUser}
                               selected={
                                   //this.state.mapDragActive ||
                                   this.state.userDragActive}
                               isActiveUser={true}
                />
                {this.state.focusUser &&
                <FocusUser userID={this.state.focusUser} onClose={() => this.handleClose("focusUser")}/>
                }
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaceUsers: getUsers(state),
    offset: state.playground.offset,
    video: state.rtc.video,
    muted: state.rtc.muted
})

const mapDispatchToProps = (dispatch: any) => ({
    move: (userCoordinates: UserCoordinates) => dispatch(submitMovement(userCoordinates)),
    changeSizeMultiplier: (scale: number) => dispatch(scalePlayground(scale)),
    movePlayground: (offset: PlaygroundOffset) => dispatch(movePlayground(offset)),
    handleZoom: (z: number, x?: number, y?: number) => dispatch(handleZoom(z, x, y)),
    setScale: (z: number, x?: number, y?: number) => dispatch(setScale(z, x, y)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(toggleUserVideo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Canvas)