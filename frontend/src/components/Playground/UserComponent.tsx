import React, {Component} from "react";
import {Message, PlaygroundOffset, User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {getCamera, getMicrophone, getScreenStream, getSpeaker, getStream} from "../../store/rtcSlice";
import {getUserMessages, userProportion} from "../../store/userSlice";
import {CircularProgress, Collapse, Grow, Popper, Tooltip, Zoom} from "@material-ui/core";
import {IoCopyOutline, IoMicOffOutline, IoVideocamOffOutline} from "react-icons/all";
import {handleSuccess} from "../../store/statusSlice";

interface OwnProps {
    user: User
    selected?: boolean
    isActiveUser?: boolean
    className?: string
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
    success: (s: string) => void
    messages: Message[]
    showVideoInAvatar: boolean
}

type Props = OwnProps & OtherProps

interface State {
    hovered: boolean
    onMessages: boolean
}

export class UserComponent extends Component<Props, State> {

    private myName: React.RefObject<HTMLMediaElement>;
    private videoObject: React.RefObject<HTMLVideoElement>;
    private messagesEnd: React.RefObject<HTMLDivElement>;
    private closeTimeout: number = -1;
    private openTimeout?: number;

    constructor(props: Props) {
        super(props);

        this.videoObject = React.createRef();
        this.messagesEnd = React.createRef();
        this.myName = React.createRef();
        this.state = {
            hovered: false,
            onMessages: false
        }
    }

    componentDidMount() {
        if (this.props.user.userStream && this.videoObject.current && !this.props.mediaChangeOngoing) {

            if (!this.videoObject.current.srcObject) {
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

        if (this.messagesEnd.current)
            this.messagesEnd.current.scrollIntoView({behavior: "smooth"});
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
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
        if (this.messagesEnd.current &&
            (prevProps.messages !== this.props.messages ||
                prevState.onMessages !== this.state.onMessages))
            this.messagesEnd.current.scrollIntoView({behavior: "smooth"});
    }

    mouseOver(onMessages?: boolean) {
        if (this.messagesEnd.current && onMessages !== this.state.onMessages)
            setTimeout(() => {
                    if (this.messagesEnd.current)
                        this.messagesEnd.current!.scrollIntoView({behavior: "smooth"})
                },
                500, [this])


        clearTimeout(this.closeTimeout)
        this.setState({
            hovered: !!onMessages,
            onMessages: !!onMessages
        })

        // Only open the messages panel after 0.5s
        if (!this.openTimeout)
            this.openTimeout = setTimeout(() => {
                this.setState({
                    hovered: true,
                    onMessages: !!onMessages
                })
            }, 500)
    }

    mouseOut() {
        clearTimeout(this.closeTimeout)

        // If timeout still active close it
        if (this.openTimeout) {
            clearTimeout(this.openTimeout)
            this.openTimeout = undefined
        }
        this.closeTimeout = setTimeout(() =>
                this.setState({
                    hovered: false,
                    onMessages: false
                })
            , 500)
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
                <div data-id={(this.props.isActiveUser) ? "activeUser" : this.props.user.id}
                     className={"User " + this.props.className}
                     style={userStyle}>
                    <Popper placement={"bottom"}
                            data-class={"clickable"}
                            onClick={() => this.setState({hovered: false})}
                            anchorEl={this.videoObject.current}
                            open={true}>
                        <Grow in={this.state.hovered && !this.props.selected && user.inProximity} unmountOnExit>
                            <div onMouseOver={() => {
                                this.mouseOver(true)
                            }}
                                 onMouseLeave={() => {
                                     this.mouseOut()
                                 }}
                                 onWheel={e => e.stopPropagation()}
                                 className={"messages clickable"}>
                                <label className={"clickable"}>
                                    {(this.props.isActiveUser) &&
                                        "Your "}
                                    {(!this.props.isActiveUser) &&
                                        user.firstName + "'s "}
                                    Messages</label>
                                <Collapse in={this.state.onMessages} unmountOnExit>
                                    <div className={"messagesWrapper"}>
                                        {this.props.messages.length > 0 &&
                                            <table cellSpacing="0" cellPadding="0" className={"clickable"}>
                                                {this.props.messages.map((m) =>
                                                    <tr className={"clickable message"}>
                                                        <td className={"clickable"}>
                                                            <label className={"clickable"}>{m.time}</label>
                                                        </td>
                                                        <td className={"clickable"}><span ref={this.messagesEnd}
                                                                                          className={"clickable"}>
                                                            {(
                                                                m.message.toLocaleLowerCase().startsWith("http") ||
                                                                m.message.toLocaleLowerCase().startsWith("www.")
                                                            ) ?
                                                                <a href={m.message}
                                                                   className={"clickable"}
                                                                   target="_blank" rel="noopener noreferrer"
                                                                >{m.message}</a> :
                                                                m.message}
                                                        </span></td>
                                                        <Tooltip title={"Copy message"} arrow placement={"right"}>
                                                            <td className={"clickable"}>
                                                                <IoCopyOutline
                                                                    className={"icon clickable"} onClick={(e) => {
                                                                    e.preventDefault()
                                                                    e.nativeEvent.preventDefault()
                                                                    e.stopPropagation()
                                                                    e.nativeEvent.stopPropagation()
                                                                    navigator.clipboard.writeText(this.props.user.message ?? "")
                                                                    this.props.success("copied message")
                                                                }}/>
                                                            </td>
                                                        </Tooltip>
                                                    </tr>
                                                )}
                                            </table>}
                                        {this.props.messages.length === 0 &&
                                            <table cellSpacing="0" cellPadding="0" className={"clickable"}>
                                                <tr className={"clickable message"}>
                                                    <td>
                                                            <span>
                                                                No messages yet.
                                                            </span>
                                                    </td>
                                                </tr>
                                            </table>
                                        }
                                    </div>
                                </Collapse>
                            </div>
                        </Grow>
                    </Popper>
                    <Tooltip TransitionComponent={Zoom} open={!!this.props.user.message} interactive
                             data-class={"clickable"}
                             title={

                                 (this.props.user.message) ?
                                     <div className={"clickable"}>
                                         {(
                                             this.props.user.message.toLocaleLowerCase().startsWith("http") ||
                                             this.props.user.message.toLocaleLowerCase().startsWith("www.")
                                         ) ?
                                             <a href={this.props.user.message}
                                                className={"clickable"}
                                                target="_blank" rel="noopener noreferrer"
                                             >{this.props.user.message}</a> :
                                             this.props.user.message}
                                         {" "}<IoCopyOutline className={"clickable"}
                                                             onClick={() => {
                                                                 navigator.clipboard.writeText(this.props.user.message ?? "")
                                                                 this.props.success("copied message")
                                                             }}/>
                                     </div>
                                     : ""} placement="top" arrow>
                        <div>
                            {(!!this.props.user.userStream && !(this.props.isActiveUser && !this.props.showVideoInAvatar)) &&
                                <video data-id={(this.props.isActiveUser) ? "activeUser" : this.props.user.id}
                                       key={this.props.camera}
                                       autoPlay muted={this.props.isActiveUser}
                                       playsInline
                                       ref={this.videoObject}
                                       onMouseOver={() => this.mouseOver()}
                                       onMouseLeave={this.mouseOut.bind(this)}
                                       className={
                                           "video " +
                                           ((!(this.props.isActiveUser && this.props.screen) && !user.video || (this.props.isActiveUser && this.props.showVideoInAvatar))) ? "profile-picture" : "" +
                                               ((user.inProximity && !this.props.isActiveUser) ? " in-proximity " : " ")
                                       }/>
                            }
                            {!this.props.user.userStream &&
                                <CircularProgress className={"loader"}/>
                            }
                        </div>
                    </Tooltip>
                </div>
                <span ref={this.myName} className={"userName " + this.props.className}
                      style={userNameStyle}>
                    {(!user.audio) && <IoMicOffOutline />}
                    {(!user.video) && <IoVideocamOffOutline />}
                    {" "}
                    {(this.props.isActiveUser) ? "You" : user.firstName + " " + user.lastName}</span>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    playgroundOffset: state.playground.offset,
    muted: state.rtc.muted,
    screen: state.rtc.screen,
    speaker: getSpeaker(state),
    camera: getCamera(state),
    microphone: getMicrophone(state),
    mediaChangeOngoing: state.rtc.mediaChangeOngoing,
    getStream: (id: string) => getStream(state, id),
    getScreenStream: (id: string) => getScreenStream(state, id),
    messages: getUserMessages(state, ownProps.user.id),
    showVideoInAvatar: state.playground.videoInAvatar
})

const mapDispatchToProps = (dispatch: any) => ({
    success: (s: string) => dispatch(handleSuccess(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(UserComponent)