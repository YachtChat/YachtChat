import React, {Component} from "react";
import {User, UserCoordinates} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {decrement, increment, incrementAsync, incrementByAmount} from "../../store/counterSlice";
import {submitMovement} from "../../store/userSlice";

interface Props{
    user: User
    onMouseDown?: (e: React.MouseEvent) => void
}


export class UserComponent extends Component<Props> {


    render() {
        const user = this.props.user
        const userStyle = {
            left: user.coordinate.x-25,
            top: user.coordinate.y-25
        }
        return(
            <div className="User" style={userStyle} onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {}}>
                {user.name}
            </div>
        )
    }
}



export default (UserComponent)