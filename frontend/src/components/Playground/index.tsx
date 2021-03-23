import React, {Component} from "react";
import {User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import './style.scss';
import {changeScaling, getUsers, submitMovement} from "../../store/userSlice";
import {displayVideo, mute} from "../../store/rtcSlice";
import UserComponent from "./UserComponent";
import NewNavigationBar from "../NavigationBar/NewNavigationBar";

interface Props {
    activeUser: User
    otherUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
    sizeMultiplier: number
    changeSizeMultiplier: (size: number) => void
    toggleAudio: () => void
    toggleVideo: () => void
    video: boolean
    muted: boolean
}

interface State {
    dragActive: boolean
    mapDragActive: boolean
}

export class Playground extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            dragActive: false,
            mapDragActive: false,
        }
    }

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStart(event: React.MouseEvent) {
        this.setState({
            dragActive: true
        })
    }

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStartTouch(event: React.TouchEvent) {
        this.setState({
            dragActive: true
        })
    }

    // function that sets the state of dragActive on false
    // if the mouse left the playground or is not holded anymore
    dragEnd() {
        this.setState({
            dragActive: false
        })
    }

    // function that moves the active user if the mouse
    moveMouse(e: React.MouseEvent) {
        if (this.state.dragActive) {
            const x = e.currentTarget.getBoundingClientRect().x
            const y = e.currentTarget.getBoundingClientRect().y
            const scaling = this.props.sizeMultiplier
            this.props.move({
                x: e.clientX / scaling - x,
                y: e.clientY / scaling - y,
                range: this.props.activeUser.position.range
            })
        }
    }

    // function that moves the active user if the mouse
    moveTouch(e: React.TouchEvent) {
        if (this.state.dragActive) {
            const scaling = this.props.sizeMultiplier
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
        this.props.changeSizeMultiplier(this.props.sizeMultiplier + 0.1)
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        this.props.changeSizeMultiplier(this.props.sizeMultiplier - 0.1)
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
                <div className="Playground" onMouseMove={this.moveMouse.bind(this)}
                     onMouseLeave={this.dragEnd.bind(this)} onMouseUp={this.dragEnd.bind(this)}
                     onWheel={this.onWheel.bind(this)} onTouchMove={this.moveTouch.bind(this)}
                     onTouchEnd={this.dragEnd.bind(this)} onKeyDown={this.handleKeyStream.bind(this)} tabIndex={0}>
                    {this.props.otherUsers.map(user => <UserComponent key={user.id} user={user}/>)}
                    <UserComponent user={this.props.activeUser} onMouseDown={this.dragStart.bind(this)}
                                   onTouchStart={this.dragStartTouch.bind(this)}/>
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
    sizeMultiplier: state.userState.scalingFactor,
    video: state.rtc.video,
    muted: state.rtc.muted
})

const mapDispatchToProps = (dispatch: any) => ({
    move: (userCoordinates: UserCoordinates) => dispatch(submitMovement(userCoordinates)),
    changeSizeMultiplier: (scale: number) => dispatch(changeScaling(scale)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Playground)