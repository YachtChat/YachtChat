import React, {Component} from "react";
import {PlaygroundOffset, User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {getStream} from "../../store/rtcSlice";
import {maxRange, userProportion} from "../../store/userSlice";

interface Props {
    user: User
    isActiveUser: boolean
    playgroundOffset: PlaygroundOffset
    muted: boolean
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
        const scale = this.props.playgroundOffset.scale
        if (this.props.user.name === null)
            return (<div/>);
        const user = this.props.user
        const userSize = userProportion * scale
        const x = user.position.x * scale
        const y = user.position.y * scale
        const offsetX = this.props.playgroundOffset.x
        const offsetY = this.props.playgroundOffset.y

        const userStyle = {
            width: userSize,
            height: userSize,
            left: x - userSize / 2 - offsetX,
            top: y - userSize / 2 - offsetY,
            opacity: (!!user.inProximity && !this.props.muted) ? 1 : 0.5,
            transform: (!!user.inProximity && !this.props.muted) ? "scale(1)" : "scale(0.8)"
        }
        // range in pixels
        const rangeInPx = 2 * maxRange * user.position.range * scale + userSize

        const rangeStyle = {
            width: rangeInPx,
            height: rangeInPx,
            left: x - rangeInPx / 2 - offsetX,
            top: y - rangeInPx / 2 - offsetY,
            opacity: (!!user.inProximity && !this.props.muted) ? 1 : 0.5
        }

        return (
            <div className={(this.props.isActiveUser) ? "activeUser" : ""}>
                <div className={"userRange"} style={rangeStyle}/>
                <div id={(this.props.isActiveUser) ? "activeUser" : ""} className="User" style={userStyle}>
                    {!!this.props.user.userStream &&
                    <video autoPlay muted={this.props.isActiveUser} ref={this.myRef}/>
                    }
                </div>
                <span>{user.name}</span>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    playgroundOffset: state.playground.offset,
    muted: state.rtc.muted
})

export default connect(mapStateToProps)(UserComponent)