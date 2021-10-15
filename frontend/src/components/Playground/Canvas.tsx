import React, {Component} from "react";
import {PlaygroundOffset, User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import './style.scss';
import {getUsers, submitMovement} from "../../store/userSlice";
import {displayVideo, mute} from "../../store/rtcSlice";
import UserComponent from "./UserComponent";
import RangeComponent from "./RangeComponent";
import {handleZoom, movePlayground, scalePlayground} from "../../store/playgroundSlice";
import FocusUser from "./focusUser";

interface Props {
    activeUser: User
    spaceUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
    offset: PlaygroundOffset
    changeSizeMultiplier: (size: number) => void
    movePlayground: (offset: PlaygroundOffset) => void
    handleZoom: (zoom: number) => void
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
    userOffset?: {x: number, y: number}
    focusUser?: string
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

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStart(event: React.MouseEvent | React.TouchEvent) {
        event.stopPropagation()
        const activeUser = ((event.target as HTMLVideoElement).dataset.id === "activeUser")
        const message = ((event.target as HTMLDivElement).dataset.id === "message")

        const clickedUserId = ((event.target as HTMLVideoElement).dataset.id)
        this.props.spaceUsers.map(user => {
            if (user.id === clickedUserId){
            //    TODO: Change size of video
                //alert("test")
                this.focus(user.id)
            //    <FocusUser open={this.state.open["focus"]} onClose={() => this.handleClose("focus")}/>
                return
            }
        })

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
                userDragActive: true,
                dragStart: {x, y},
                userOffset: {x: userOffsetx, y: userOffsety}
            })
        else if (canvas)
            this.setState({
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
        // Click functionality
        if ((!this.state.dragStart ||
            this.state.dragStart.x === e.clientX ||
            this.state.dragStart.y === e.clientY) &&
            !(e.target as HTMLDivElement).classList.contains("MuiTooltip-tooltip")
        ) {
            const scaling = this.props.offset.scale
            const x = e.currentTarget.getBoundingClientRect().x
            const y = e.currentTarget.getBoundingClientRect().y
            this.props.move({
                x: e.clientX / scaling - x + this.props.offset.x,
                y: e.clientY / scaling - y + this.props.offset.y,
                range: this.props.activeUser.position!.range
            })
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
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y
        const clientX = e.touches[0].clientX
        const clientY = e.touches[0].clientY
        this.move(x, y, clientX, clientY)
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
        if (event.deltaY < 0 || event.deltaX < 0) {
            this.props.handleZoom(event.deltaY / 1000)
        }

        if (event.deltaY > 0 || event.deltaX > 0) {
            this.props.handleZoom(event.deltaY / 1000)
        }
    }

    handleKeyStream(event: React.KeyboardEvent) {
        console.log("Event")
        if (event.key === "m") { //"m"
            this.props.toggleAudio()
        }
        if (event.key === "c") { //"c"
            this.props.toggleVideo()
        }
    }

    render() {
        const scaling = this.props.offset.scale
        const style = {
            backgroundPosition: `${-this.props.offset.x * scaling}px ${-this.props.offset.y * scaling}px`,
            backgroundSize: `${3 * scaling}rem ${3 * scaling}rem`
        }
        return (
            <div id={"Playground"} style={style} className="Playground"
                 onMouseMove={this.moveMouse.bind(this)}
                 onMouseLeave={this.dragEnd.bind(this)}
                 onMouseUp={this.onMouseUp.bind(this)}
                 onWheel={this.onWheel.bind(this)}
                 onTouchMove={this.moveTouch.bind(this)}
                 onTouchEnd={this.dragEnd.bind(this)}
                 onKeyDown={this.handleKeyStream.bind(this)}
                 onMouseDown={this.dragStart.bind(this)}
                 onTouchStart={this.dragStart.bind(this)}
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
                    return <UserComponent key={user.id} isActiveUser={false}
                                          selected={false} user={user}/>
                })}
                <UserComponent user={this.props.activeUser}
                               selected={
                                   //this.state.mapDragActive ||
                                   this.state.userDragActive}
                               isActiveUser={true}/>
                <FocusUser userID={this.state.focusUser} onClose={() => this.handleClose("focusUser")}/>
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
    handleZoom: (z: number) => dispatch(handleZoom(z)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Canvas)