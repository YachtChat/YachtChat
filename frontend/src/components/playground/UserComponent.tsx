import React, {Component} from "react";
import {User} from "../../store/models";

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
            <div id={(!!this.props.onMouseDown) ? "activeUser" : ""} className="User" style={userStyle} onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {}}>
                {user.name}
            </div>
        )
    }
}

export default (UserComponent)