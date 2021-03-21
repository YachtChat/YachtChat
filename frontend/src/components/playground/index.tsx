import React, {Component} from "react";
import {User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import UserComponent from "./UserComponent";
import './style.scss';
import {submitMovement, getUsers, changeScaling} from "../../store/userSlice";
import NavigationBar from "../navigationbar/NavigationBar";

interface Props {
    activeUser: User
    otherUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
    sizeMultiplier: number
    changeSizeMultiplier: (size: number) => void
}

interface State {
    dragActive: boolean
}

export class Playground extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            dragActive: false
        }
    }

    // function that sets the state of dragActive on true
    // if the mouse is clicked on the active user
    dragStart(event: React.MouseEvent) {
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
            const scaling = this.props.sizeMultiplier
            this.props.move({x: e.pageX * 1/scaling, y: e.pageY * 1/scaling, range: this.props.activeUser.position.range})
        }
    }

    // function handleZoomIn increases the sizeMultiplier
    handleZoomIn() {
        if (this.props.sizeMultiplier <= 2.0) {
            this.props.changeSizeMultiplier(this.props.sizeMultiplier + 0.1)
        }
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        if (this.props.sizeMultiplier >= 0.5) {
            this.props.changeSizeMultiplier(this.props.sizeMultiplier - 0.1)
        }

    }
    // calls handleZoomOut if user scrolls down/ handleZoomIn if user scrolls up
    onWheel(event: any){
        if(event.deltaY < 0 || event.deltaX < 0) {
            this.handleZoomOut()
        }

        if(event.deltaY > 0 || event.deltaX > 0){
            this.handleZoomIn()
        }
    }

    render() {
        return (
            <div className={"contentWrapper"}>
                <NavigationBar/>
                <div className="Playground" onMouseMove={this.moveMouse.bind(this)}
                     onMouseLeave={this.dragEnd.bind(this)} onMouseUp={this.dragEnd.bind(this)}
                     onWheel={this.onWheel.bind(this)}>
                    {this.props.otherUsers.map(user => <UserComponent key={user.id} user={user}/>)}
                    <UserComponent user={this.props.activeUser} onMouseDown={this.dragStart.bind(this)}/>
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
    sizeMultiplier: state.userState.scalingFactor
})

const mapDispatchToProps = (dispatch: any) => ({
    move: (userCoordinates: UserCoordinates) => dispatch(submitMovement(userCoordinates)),
    changeSizeMultiplier: (scale: number) => dispatch(changeScaling(scale))
})


export default connect(mapStateToProps, mapDispatchToProps)(Playground)