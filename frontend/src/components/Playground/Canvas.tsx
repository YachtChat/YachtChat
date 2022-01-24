import React, {Component} from "react";
import {PlaygroundOffset, UserCoordinates} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import './style.scss';
import {getOnlineUsersWrapped, getUser, submitMovement} from "../../store/userSlice";
import {toggleUserVideo, toggleUserAudio} from "../../store/mediaSlice";
import UserComponent from "./UserComponent";
import RangeComponent from "./RangeComponent";
import {handleZoom, movePlayground, scalePlayground, setScale} from "../../store/playgroundSlice";
import FocusUser from "./focusUser";
import {UserWrapper} from "../../store/model/UserWrapper";
import {Fade} from "@mui/material";

interface Props {
    activeUser: UserWrapper
    spaceUsers: UserWrapper[]
    move: (userCoordinates: UserCoordinates, isDragActivated: boolean) => void
    offset: PlaygroundOffset
    changeSizeMultiplier: (size: number) => void
    movePlayground: (offset: PlaygroundOffset) => void
    handleZoom: (zoom: number, x?: number, y?: number) => void
    setScale: (zoom: number, x?: number, y?: number) => void
    toggleAudio: () => void
    toggleVideo: () => void
    spaceID: string
    inBackground: boolean
}

interface State {
    userDragActive: boolean // If the user is actively dragged
    mapDragActive: boolean // If the map is dragged
    scrolling: boolean // When true animations will be paused - active while scrolling
    previousOffset?: { x: number, y: number } // Previous offset of the map
    previousPosition?: { x: number, y: number } // Previous position of the user
    dragStart?: { x: number, y: number } // Start position of the drag
    userOffset?: { x: number, y: number } // Offset on the user itself
    pinchStart?: { x1: number, y1: number, x2: number, y2: number, scale: number } // Position of the pinch start
    focusUser?: string // which user is beeing focused on
    possibleFocusUser?: string // captured on the drag start – could become focus user when same user on dragend
}

export class Canvas extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            userDragActive: false,
            mapDragActive: false,
            scrolling: false,
        }
    }

    focus(userID: string) {
        if (!this.state.focusUser) {
            this.setState({
                focusUser: userID
            })
        }
    }

    handleClose() {
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
        if ((event.target as HTMLElement).classList.contains("clickable") || this.props.inBackground)
            return

        // Figure out which element was clicked
        const activeUser = ((event.target as HTMLVideoElement).dataset.id === "activeUser")
        const message = ((event.target as HTMLDivElement).dataset.id === "message")

        const clickedUserId = ((event.target as HTMLVideoElement).dataset.id)

        const canvas = !(activeUser || message)

        // Capture mouse/touch position
        let x, y;
        if (event.type === "mousedown") {
            x = (event as React.MouseEvent).clientX
            y = (event as React.MouseEvent).clientY
        } else {
            x = (event as React.TouchEvent).touches[0].clientX
            y = (event as React.TouchEvent).touches[0].clientY
        }

        // offset on top of the user itself
        const userOffsetX = x / this.props.offset.scale + this.props.offset.x  - this.props.activeUser.position!.x
        const userOffsetY = y / this.props.offset.scale + this.props.offset.y - this.props.activeUser.position!.y

        // If user was clicked
        if (activeUser)
            this.setState({
                possibleFocusUser: clickedUserId,
                userDragActive: true,
                dragStart: {x, y},
                userOffset: {x: userOffsetX, y: userOffsetY}
            })
        // If user clicked on the map
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
        // If labeled as clickable no action is done
        if ((e.target as HTMLElement).classList.contains("clickable")) {
            this.dragEnd(e)
            return
        }


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
                if (user.id === clickedUserId && user.inRange) {
                    this.focus(user.id)
                    focused = true
                }
            })

            // If not opened fullscreen jump to that spot
            if (!focused && clickedUserId !== "activeUser") {
                const scaling = this.props.offset.scale
                const x = e.currentTarget.getBoundingClientRect().x
                const y = e.currentTarget.getBoundingClientRect().y
                this.props.move({
                    x: e.clientX / scaling - x + this.props.offset.x,
                    y: e.clientY / scaling - y + this.props.offset.y + 10,
                    range: this.props.activeUser.position!.range
                }, this.state.userDragActive)
            }
        }
        this.dragEnd(e)
    }

    // function that sets the state of dragActive on false
    // if the mouse left the playground or is not pressed anymore
    dragEnd(e: React.MouseEvent | React.TouchEvent) {
        if (this.state.userDragActive) {
            this.props.move(this.props.activeUser.position!, false)
        }
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
        const clientX = e.clientX
        const clientY = e.clientY
        this.move(clientX, clientY)
    }

    // function that moves the active user if user touches
    moveTouch(e: React.TouchEvent) {
        e.preventDefault()
        const clientX = e.touches[0].clientX
        const clientY = e.touches[0].clientY
        this.move(clientX, clientY)

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

    move(clientX: number, clientY: number) {
        // move(x: number, y: number, clientX: number, clientY: number) {
        const scaling = this.props.offset.scale
        if (this.state.userDragActive) {
            this.props.move({
                x: clientX / scaling + this.props.offset.x - this.state.userOffset!.x,
                y: clientY / scaling + this.props.offset.y - this.state.userOffset!.y,
                range: this.props.activeUser.position!.range
            }, this.state.userDragActive)
        }
        if (this.state.mapDragActive) {
            const prev = this.state.previousOffset!
            const start = this.state.dragStart!
            this.props.movePlayground({
                ...this.props.offset,
                x: (prev.x + (start.x - clientX) / scaling),
                y: (prev.y + (start.y - clientY) / scaling)
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

        this.setState({
            scrolling: true
        })

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

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.state.scrolling) {
            if (prevProps.offset.scale === this.props.offset.scale) {
                this.setState({
                    scrolling: false
                })
            }
        }
    }

    componentDidMount() {
        // Enable Safari pinch to zoom gesture
        window.addEventListener("gesturestart", (e: any) => {
            e.preventDefault()
            this.setState({
                scrolling: true,
                pinchStart: {x1: 0, x2: 0, y1: 0, y2: 0, scale: this.props.offset.trueScale}
            })
        })
        window.addEventListener("gesturechange", (e: any) => {
            e.preventDefault();
            this.setState({
                scrolling: true,
            })
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
        const animate = this.state.userDragActive || this.state.mapDragActive || this.state.scrolling
        return (
            <div id="PlaygroundCanvas" style={style} className={"PlaygroundCanvas " +
                ((animate) ? "" : "animate")
            }
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
                {this.props.spaceUsers.map(user => (
                    <Fade in={user.online} unmountOnExit>
                        <div>
                            <RangeComponent key={user.id}
                                            className={(animate) ? "" : "animate"}
                                            user={user}/>
                        </div>
                    </Fade>
                ))}
                <RangeComponent user={this.props.activeUser}
                                className={(animate) ? "" : "animate"}
                                selected={this.state.mapDragActive || this.state.userDragActive}
                                isActiveUser/>
                {this.props.spaceUsers.map(user =>
                    <Fade in={user.online} unmountOnExit>
                        <div>
                            <UserComponent key={user.id}
                                           className={(animate) ? "" : "animate"}
                                           user={user}/>
                        </div>
                    </Fade>
                )}
                <UserComponent
                    className={(animate) ? "" : "animate"}
                    user={this.props.activeUser}
                    selected={
                        //this.state.mapDragActive ||
                        this.state.userDragActive
                    } />
                {this.state.focusUser &&
                    <FocusUser userID={this.state.focusUser} spaceID={this.props.spaceID}
                               onClose={() => this.handleClose()}/>
                }
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: new UserWrapper(getUser(state)),
    spaceUsers: getOnlineUsersWrapped(state),
    offset: state.playground.offset,
    inBackground: state.playground.inBackground,
})

const mapDispatchToProps = (dispatch: any) => ({
    move: (userCoordinates: UserCoordinates, isDragActivated: boolean) => dispatch(submitMovement(userCoordinates, isDragActivated)),
    changeSizeMultiplier: (scale: number) => dispatch(scalePlayground(scale)),
    movePlayground: (offset: PlaygroundOffset) => dispatch(movePlayground(offset)),
    handleZoom: (z: number, x?: number, y?: number) => dispatch(handleZoom(z, x, y)),
    setScale: (z: number, x?: number, y?: number) => dispatch(setScale(z, x, y)),
    toggleAudio: () => dispatch(toggleUserAudio()),
    toggleVideo: () => dispatch(toggleUserVideo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Canvas)