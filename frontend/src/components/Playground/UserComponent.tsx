import React, {Component} from "react";
import {PlaygroundOffset, User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {getCamera, getMicrophone, getSpeaker, getStream} from "../../store/rtcSlice";
import {userProportion} from "../../store/userSlice";
import {Tooltip, Zoom} from "@material-ui/core";

interface Props {
    user: User
    selected: boolean
    isActiveUser: boolean
    playgroundOffset: PlaygroundOffset
    muted: boolean
    speaker: string
    camera: string
    microphone: string
    getStream: (id: string) => MediaStream | undefined
    mediaChangeOngoing: boolean
}

export class UserComponent extends Component<Props> {

    private myName: React.RefObject<HTMLMediaElement>;
    private videoObject: React.RefObject<HTMLVideoElement>;

    constructor(props: Props) {
        super(props);

        this.videoObject = React.createRef();
        this.myName = React.createRef();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.user.userStream && this.videoObject.current && !this.props.mediaChangeOngoing) {

            if (!this.videoObject.current.srcObject ||
                this.props.mediaChangeOngoing !== prevProps.mediaChangeOngoing) {
                this.videoObject.current.srcObject = this.props.getStream(this.props.user.id)!
                console.log(this.props.getStream(this.props.user.id)!)
            }

            //@ts-ignore
            if (this.videoObject.current.setSinkId)
                //@ts-ignore
                this.videoObject.current.setSinkId(this.props.speaker)
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
        const offsetX = this.props.playgroundOffset.x * scale
        const offsetY = this.props.playgroundOffset.y * scale
        let userOpacity = ((!!user.inProximity && !this.props.muted) || this.props.selected) ? 1 : 0.5
        let userScale = (!!user.inProximity && !this.props.muted) ? "scale(1)" : "scale(0.8)"
        if (this.props.selected) {
            userScale = "scale(1.2)"
        }

        let nameWidth = 0
        let nameHeight = 0
        let nameOpacity = 0.7

        if (this.myName.current) {
            nameWidth = this.myName.current.getBoundingClientRect().width
            nameHeight = this.myName.current.getBoundingClientRect().height
        }

        let userNamePosX = x - nameWidth / 2 - offsetX
        let userNamePosY = y + userSize / 2 - offsetY + 15

        if (userNamePosX < 0) {
            userNamePosX = 15 + nameWidth
            nameOpacity = 0
        }
        if (userNamePosX > window.innerWidth) {
            userNamePosX = window.innerWidth - (15 - nameWidth)
            nameOpacity = 0
        }

        if (userNamePosY < 0) {
            userNamePosY = 15 + nameWidth
            nameOpacity = 0
        }
        if (userNamePosY > window.innerHeight) {
            userNamePosY = window.innerHeight - (15 - nameHeight)
            nameOpacity = 0
        }

        const userStyle = {
            width: userSize,
            height: userSize,
            left: x - userSize / 2 - offsetX,
            top: y - userSize / 2 - offsetY,
            opacity: userOpacity,
            transform: userScale,
            boxShadow: (this.props.selected) ? "0 0 20px rgba(0,0,0,0.5)" : "none",
            backgroundImage: `url(${user.profilePic})`,
        }

        const userNameStyle = {
            left: userNamePosX,
            top: userNamePosY,
            transform: (!!user.inProximity && !this.props.muted) ? "scale(1)" : "scale(0.8)",
            opacity: nameOpacity
        }

        return (
            <div className={(this.props.isActiveUser) ? "activeUser" : ""}>
                <div data-id={(this.props.isActiveUser) ? "activeUser" : ""} className="User" style={userStyle}>
                    <Tooltip data-id={"message"} TransitionComponent={Zoom} open={!!this.props.user.message} interactive
                             title={
                                 (this.props.user.message) ?
                                     (this.props.user.message.toLocaleLowerCase().startsWith("http")) ?
                                         <a href={this.props.user.message}
                                            target="_blank" rel="noopener noreferrer"
                                         >{this.props.user.message}</a> :
                                         this.props.user.message
                                     : ""} placement="top" arrow>
                        <div>
                            {!!this.props.user.userStream &&
                            <video data-id={(this.props.isActiveUser) ? "activeUser" : ""} key={this.props.camera}
                                   autoPlay muted={this.props.isActiveUser}
                                   ref={this.videoObject}
                                   className={(!user.image) ? "profile-picture" : ""}/>
                            }
                        </div>
                    </Tooltip>
                </div>
                <span ref={this.myName} className={"userName"}
                      style={userNameStyle}>{(this.props.isActiveUser) ? "You" : user.name}</span>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    playgroundOffset: state.playground.offset,
    muted: state.rtc.muted,
    speaker: getSpeaker(state),
    camera: getCamera(state),
    microphone: getMicrophone(state),
    mediaChangeOngoing: state.rtc.mediaChangeOngoing,
    getStream: (id: string) => getStream(state, id),
})

export default connect(mapStateToProps)(UserComponent)