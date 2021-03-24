import React, {Component} from "react";
import {PlaygroundOffset, User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import './style.scss';
import {getUsers, submitMovement} from "../../store/userSlice";
import {displayVideo, mute} from "../../store/rtcSlice";
import UserComponent from "./UserComponent";
import NewNavigationBar from "../NavigationBar/NewNavigationBar";
import {movePlayground, scalePlayground} from "../../store/playgroundSlice";

interface Props {
    activeUser: User
    otherUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
    offset: PlaygroundOffset
    changeSizeMultiplier: (size: number) => void
    movePlayground: (offset: PlaygroundOffset) => void
    toggleAudio: () => void
    toggleVideo: () => void
    video: boolean
    muted: boolean
}

interface State {
    userDragActive: boolean
    mapDragActive: boolean
    previousOffset?: { x: number, y: number }
    dragStart?: { x: number, y: number }
}

export class Playground extends Component<Props, State> {

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
        // @ts-ignore
        const id = event.target.id

        let x, y;

        if (event.type === "mousedown") {
            x = (event as React.MouseEvent).clientX
            y = (event as React.MouseEvent).clientY
        } else {
            x = (event as React.TouchEvent).touches[0].clientX
            y = (event as React.TouchEvent).touches[0].clientY
        }

        if (id === "activeUser")
            this.setState({
                userDragActive: true,
                dragStart: {x, y}
            })
        else
            this.setState({
                mapDragActive: true,
                previousOffset: this.props.offset,
                dragStart: {x, y}
            })
    }

    onMouseUp(e: React.MouseEvent) {
        const scaling = this.props.offset.scale
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y

        if (!this.state.dragStart ||
            this.state.dragStart.x === e.clientX ||
            this.state.dragStart.y === e.clientY) {
            this.props.move({
                x: e.clientX / scaling - x + this.props.offset.x / scaling,
                y: e.clientY / scaling - y + this.props.offset.y / scaling,
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
            previousOffset: undefined
        })
    }

    // function that moves the active user if the mouse
    moveMouse(e: React.MouseEvent) {
        const scaling = this.props.offset.scale
        const x = e.currentTarget.getBoundingClientRect().x
        const y = e.currentTarget.getBoundingClientRect().y
        if (this.state.userDragActive) {
            this.props.move({
                x: e.clientX / scaling - x + this.props.offset.x / scaling,
                y: e.clientY / scaling - y + this.props.offset.y / scaling,
                range: this.props.activeUser.position.range
            })
        }
        if (this.state.mapDragActive) {
            const prev = this.state.previousOffset!
            const start = this.state.dragStart!
            this.props.movePlayground({
                ...this.props.offset,
                x: (prev.x + (start.x - e.clientX)) - x,
                y: (prev.y + (start.y - e.clientY)) - y
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
        this.props.changeSizeMultiplier(this.props.offset.scale + 0.1)
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        this.props.changeSizeMultiplier(this.props.offset.scale - 0.1)
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
        return (
            <div className={"contentWrapper"}>
                <div className={"navwrapper"}>
                    <NewNavigationBar/>
                </div>
                <div id={"Playground"} className="Playground"
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
                    {this.props.otherUsers.map(user => <UserComponent key={user.id} isActiveUser={false} user={user}/>)}
                    <UserComponent user={this.props.activeUser} isActiveUser={true}/>
                    {/*<div className="roomgrid">*/}
                    {/*    <Room roomName="Thinktank"/>*/}
                    {/*    <Room roomName="Kitchen"/>*/}
                    {/*</div>*/}
                </div>
                <div className="btn">
                    <button onClick={this.handleZoomIn.bind(this)}>+</button>
                    <button onClick={this.handleZoomOut.bind(this)}>-</button>
                </div>
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
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Playground)