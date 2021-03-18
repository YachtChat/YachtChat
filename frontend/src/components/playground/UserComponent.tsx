import React, {Component} from "react";
import {User} from "../../store/models";

interface Props{
    user: User
    onMouseDown?: (e: React.MouseEvent) => void
}

export class UserComponent extends Component<Props> {
    private myRef: React.RefObject<HTMLVideoElement>;


    constructor(props: Props) {
        super(props);

        this.myRef = React.createRef();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.myRef.current && !this.myRef.current.srcObject) {
            this.myRef.current.srcObject = this.props.user.userStream
        }
    }

    render() {
        const user = this.props.user
        const userStyle = {
            left: user.coordinate.x-25,
            top: user.coordinate.y-25
        }
        return(
            <div id={(!!this.props.onMouseDown) ? "activeUser" : ""} className="User" style={userStyle} onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {}}>
                {user.name}
                {!!this.props.user.userStream &&
                    <video autoPlay ref={this.myRef} />
                }
            </div>
        )
    }
}

export default (UserComponent)