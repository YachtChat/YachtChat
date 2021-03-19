import React, {Component} from "react";
import {User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import UserComponent from "./UserComponent";
import './style.scss';
import {submitMovement} from "../../store/userSlice";


interface Props{
    activeUser: User
    otherUsers: User[]
    move: (userCoordinates: UserCoordinates) => void
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

    dragStart(event: React.MouseEvent) {
        this.setState({
            dragActive: true
        })
    }

    dragEnd () {
        this.setState({
            dragActive: false
        })
    }

    moveMouse(e: React.MouseEvent) {
        if (this.state.dragActive) {
            this.props.move({x: e.pageX, y: e.pageY, range: this.props.activeUser.position.range})
        }
    }

    render() {
        return(
            <div className="Playground" onMouseMove={this.moveMouse.bind(this)} onMouseLeave={this.dragEnd.bind(this)} onMouseUp={this.dragEnd.bind(this)}>
                {this.props.otherUsers.map(user => <UserComponent user={user}/>)}
                <UserComponent user={this.props.activeUser} onMouseDown={this.dragStart.bind(this)} />
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    otherUsers: state.userState.otherUsers,
})

const mapDispatchToProps = (dispatch: any) => ({
    move: (userCoordinates: UserCoordinates) => dispatch(submitMovement(userCoordinates)),
})

export default connect(mapStateToProps,  mapDispatchToProps)(Playground)