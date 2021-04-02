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

interface Props {
    activeUser: User
    otherUsers: User[]
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
}

export class Canvas extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            userDragActive: false,
            mapDragActive: false,
        }
    }

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStart(event: React.MouseEvent | React.TouchEvent) {
        event.stopPropagation()
        const activeUser = ((event.target as HTMLDivElement).dataset.id === "activeUser")

        let x, y;

        if (event.type === "mousedown") {
            x = (event as React.MouseEvent).clientX
            y = (event as React.MouseEvent).clientY
        } else {
            x = (event as React.TouchEvent).touches[0].clientX
            y = (event as React.TouchEvent).touches[0].clientY
        }

        if (activeUser)
            this.setState({
                userDragActive: true,
                dragStart: {x, y}
            })
        else
            this.setState({
                mapDragActive: true,
                previousOffset: this.props.offset,
                previousPosition: {
                    x: this.props.activeUser.position.x,
                    y: this.props.activeUser.position.y
                },
                dragStart: {x, y}
            })
    }

    onMouseUp(e: React.MouseEvent) {
        // Click functionality
        if (!this.state.dragStart ||
            this.state.dragStart.x === e.clientX ||
            this.state.dragStart.y === e.clientY) {
            const scaling = this.props.offset.scale
            const x = e.currentTarget.getBoundingClientRect().x
            const y = e.currentTarget.getBoundingClientRect().y
            this.props.move({
                x: e.clientX / scaling - x + this.props.offset.x,
                y: e.clientY / scaling - y + this.props.offset.y,
                range: this.props.activeUser.position.range
            })
        }
        this.dragEnd(e)
    }

    // function that sets the state of dragActive on false
    // if the mouse left the playground or is not holded anymore
    dragEnd(e: React.MouseEvent) {
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
        const scaling = this.props.offset.scale
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y
        if (this.state.userDragActive) {
            this.props.move({
                x: e.clientX / scaling - x + this.props.offset.x,
                y: e.clientY / scaling - y + this.props.offset.y,
                range: this.props.activeUser.position.range
            })
        }
        if (this.state.mapDragActive) {
            const prev = this.state.previousOffset!
            const start = this.state.dragStart!
            this.props.movePlayground({
                ...this.props.offset,
                x: (prev.x + (start.x - e.clientX) / scaling) - x,
                y: (prev.y + (start.y - e.clientY) / scaling) - y
            })
            this.props.move({
                x: this.state.previousPosition!.x + (start.x - e.clientX) / scaling,
                y: this.state.previousPosition!.y + (start.y - e.clientY) / scaling,
                range: this.props.activeUser.position.range
            })
        }
    }

    // function that moves the active user if the mouse
    moveTouch(e: React.TouchEvent) {
        if (this.state.userDragActive) {
            const scaling = this.props.offset.scale
            alert("moveTouch triggered")
            this.props.move({
                x: e.touches[0].clientX / scaling,
                y: e.touches[0].clientY / scaling,
                range: this.props.activeUser.position.range
            })
        }
    }

    // function handleZoomIn increases the sizeMultiplier
    handleZoomIn() {
        //this.props.changeSizeMultiplier(this.props.offset.scale + 0.1)
        this.props.handleZoom(0.05)
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        //this.props.changeSizeMultiplier(this.props.offset.scale - 0.1)
        this.props.handleZoom(-0.05)
    }

    // calls handleZoomOut if user scrolls down/ handleZoomIn if user scrolls up
    onWheel(event: any) {
        if (event.deltaY < 0 || event.deltaX < 0) {
            this.handleZoomOut()
        }

        if (event.deltaY > 0 || event.deltaX > 0) {
            this.handleZoomIn()
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
                //onTouchEnd={this.dragEnd.bind(this)}
                 onKeyDown={this.handleKeyStream.bind(this)}
                 onMouseDown={this.dragStart.bind(this)}
                 onTouchStart={this.dragStart.bind(this)}
                 tabIndex={0}>
                {this.props.otherUsers.map(user => <RangeComponent key={user.id} isActiveUser={false}
                                                                   selected={false} user={user}/>)}
                <RangeComponent user={this.props.activeUser}
                                selected={this.state.mapDragActive || this.state.userDragActive}
                                isActiveUser={true}/>
                {this.props.otherUsers.map(user => <UserComponent key={user.id} isActiveUser={false}
                                                                  selected={false} user={user}/>)}
                <UserComponent user={this.props.activeUser}
                               selected={this.state.mapDragActive || this.state.userDragActive}
                               isActiveUser={true}/>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    otherUsers: getUsers(state),
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