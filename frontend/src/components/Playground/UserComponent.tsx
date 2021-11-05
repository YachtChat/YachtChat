import React, {Component} from "react";
import {PlaygroundOffset, User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {getCamera, getMicrophone, getScreenStream, getSpeaker, getStream} from "../../store/rtcSlice";
import {userProportion} from "../../store/userSlice";
import {CircularProgress, Tooltip, Zoom} from "@material-ui/core";

interface OwnProps {
    user: User
    selected: boolean
    isActiveUser: boolean
}

interface OtherProps {
    playgroundOffset: PlaygroundOffset
    muted: boolean
    screen: boolean
    speaker: string
    camera: string
    microphone: string
    getStream: (id: string) => MediaStream | undefined
    getScreenStream: (id: string) => MediaStream | undefined
    mediaChangeOngoing: boolean
}

type Props = OwnProps & OtherProps

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
                if (this.props.screen && this.props.isActiveUser) {
                    this.videoObject.current.srcObject = this.props.getScreenStream(this.props.user.id)!
                } else {
                    this.videoObject.current.srcObject = this.props.getStream(this.props.user.id)!
                }
                //console.log(this.props.getStream(this.props.user.id)!)
            }

            //@ts-ignore
            if (this.videoObject.current.setSinkId)
                //@ts-ignore
                this.videoObject.current.setSinkId(this.props.speaker)
        }
    }

    render() {
        const scale = this.props.playgroundOffset.scale
        if (this.props.user.firstName === null)
            return (<div/>);
        const user = this.props.user
        const userSize = userProportion * scale
        const x = user.position!.x * scale
        const y = user.position!.y * scale
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

        if (userNamePosX < 15) {
            userNamePosX = 15
            nameOpacity = 0.45
        }
        if (userNamePosX > window.innerWidth - (15 + nameWidth)) {
            userNamePosX = window.innerWidth - (15 + nameWidth)
            nameOpacity = 0.45
        }

        if (userNamePosY < 15) {
            userNamePosY = 15
            nameOpacity = 0.45
        }
        if (userNamePosY > window.innerHeight - (15 + nameHeight)) {
            userNamePosY = window.innerHeight - (15 + nameHeight)
            nameOpacity = 0.45
        }

        const userStyle = {
            width: userSize,
            height: userSize,
            left: x - userSize / 2 - offsetX,
            top: y - userSize / 2 - offsetY,
            opacity: userOpacity,
            transform: userScale,
            boxShadow: (this.props.selected) ? "0 0 20px rgba(0,0,0,0.5)" : "none",
            // If no screen is beeing shared or video is shown or no stream is available show profile pic
            backgroundImage: ((!(this.props.isActiveUser && this.props.screen) && !user.video) || !this.videoObject.current?.srcObject) ? `url(${user.profile_image})` : "none",
        }

        const userNameStyle = {
            left: userNamePosX,
            top: userNamePosY,
            transform: (!!user.inProximity && !this.props.muted) ? "scale(1)" : "scale(0.8)",
            opacity: nameOpacity
        }

        return (
            <div className={(this.props.isActiveUser) ? "activeUser" : ""}>
                <div data-id={(this.props.isActiveUser) ? "activeUser" : this.props.user.id} className="User" style={userStyle}>
                    <Tooltip TransitionComponent={Zoom} open={!!this.props.user.message} interactive
                             onClick={e => {
                                 e.preventDefault()
                                 e.stopPropagation()
                             }}
                             title={
                                 (this.props.user.message) ?
                                     (this.props.user.message.toLocaleLowerCase().startsWith("http")) ?
                                         <a href={this.props.user.message}
                                            target="_blank" rel="noopener noreferrer"
                                         >{this.props.user.message}</a> :
                                         this.props.user.message
                                     : ""} placement="top" arrow>
                        <div>
                            {(!!this.props.user.userStream) &&
                            <video data-id={(this.props.isActiveUser) ? "activeUser" : this.props.user.id}
                                   key={this.props.camera}
                                   autoPlay muted={this.props.isActiveUser}
                                   playsInline
                                   ref={this.videoObject}
                                   className={
                                       ((!(this.props.isActiveUser && this.props.screen) && !user.video)) ? "profile-picture" : "" +
                                           ((user.inProximity && !this.props.isActiveUser) ? " in-proximity" : "")}/>
                            }
                            {!this.props.user.userStream &&
                            <CircularProgress className={"loader"}/>
                            }
                        </div>
                    </Tooltip>
                </div>
                <span ref={this.myName} className={"userName"}
                      style={userNameStyle}>{(this.props.isActiveUser) ? "You" : user.firstName + " " + user.lastName}</span>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    playgroundOffset: state.playground.offset,
    muted: state.rtc.muted,
    screen: state.rtc.screen,
    speaker: getSpeaker(state),
    camera: getCamera(state),
    microphone: getMicrophone(state),
    mediaChangeOngoing: state.rtc.mediaChangeOngoing,
    getStream: (id: string) => getStream(state, id),
    getScreenStream: (id: string) => getScreenStream(state, id),
})

export default connect(mapStateToProps)(UserComponent)