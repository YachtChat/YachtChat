import React, {Component} from "react";
import {User} from "../../store/models";
import {getStream} from "../../store/connectionSlice";

interface Props {
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
        if (this.props.user.userStream && this.myRef.current && !this.myRef.current.srcObject) {
            this.myRef.current.srcObject = getStream(this.props.user.id)
        }
    }

    render() {
        if (this.props.user.name === null)
            return (<div/>);
        const user = this.props.user
        const userSize = 100
        const userStyle = {
            width: userSize,
            height: userSize,
            left: user.position.x - userSize / 2,
            top: user.position.y - userSize / 2
        }
        // range in pixels
        const maxRange = 300
        const rangeInPx = 2 * maxRange * user.position.range + userSize

        const rangeStyle = {
            width: rangeInPx,
            height: rangeInPx,
            left: user.position.x - rangeInPx / 2,
            top: user.position.y - rangeInPx / 2
        }

        return (
            <div className={(!!this.props.onMouseDown) ? "activeUser" : ""}>
                <div className={"userRange"} style={rangeStyle}/>
                <div className="User" style={userStyle}
                     onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {
                     }}>
                    {user.name}
                    {!!this.props.user.userStream &&
                    <video autoPlay muted={!!this.props.onMouseDown} ref={this.myRef}/>
                    }
                </div>
            </div>
        )
    }
}

export default (UserComponent)