import React, {Component} from "react";
import {User} from "../../store/models";
import {getStream} from "../../store/userSlice";

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
        if (!!this.props.user.userStream && this.myRef.current && !this.myRef.current.srcObject) {
            this.myRef.current.srcObject = getStream(this.props.user.userStream)
        }
    }

    render() {
        if (this.props.user.name === null)
            return (<div/>);
        const user = this.props.user
        const userStyle = {
            left: user.position.x - 50,
            top: user.position.y - 50
        }
        return (
            <div id={(!!this.props.onMouseDown) ? "activeUser" : ""} className="User" style={userStyle}
                 onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {
                 }}>
                {user.name}
                {!!this.props.user.userStream &&
                <video autoPlay ref={this.myRef}/>
                }
            </div>
        )
    }
}

export default (UserComponent)