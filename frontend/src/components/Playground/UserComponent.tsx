import React, {Component} from "react";
import {MediaType, Message, PlaygroundOffset} from "../../store/model/model";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {getCamera, getMicrophone, getScreenStream, getSpeaker, getStream} from "../../store/mediaSlice";
import {getUserMessages, userProportion} from "../../store/userSlice";
import {CircularProgress, Collapse, Grow, Popper, Tooltip, Zoom} from "@material-ui/core";
import {IoCopyOutline, IoMicOffOutline, IoVideocamOffOutline} from "react-icons/all";
import {handleSuccess} from "../../store/statusSlice";
import {convertRemToPixels} from "../../store/utils";
import {centerUser} from "../../store/playgroundSlice";
import {UserWrapper} from "../../store/model/UserWrapper";

interface OwnProps {
    user: UserWrapper
    selected?: boolean
    isActiveUser?: boolean
    className?: string
}

interface OtherProps {
    playgroundOffset: PlaygroundOffset
    userStream: Record<MediaType, string | undefined>
    speaker: string
    camera: string
    microphone: string
    getStream: (id: string) => MediaStream | undefined
    getScreenStream: (id: string) => MediaStream | undefined
    success: (s: string) => void
    messages: Message[]
    showVideoInAvatar: boolean
    center: () => void
}

type Props = OwnProps & OtherProps

interface State {
    hovered: boolean
    onMessages: boolean
}

export class UserComponent extends Component<Props, State> {

    private myName: React.RefObject<HTMLMediaElement>;
    private mediaElement: React.RefObject<HTMLVideoElement>;
    private messagesEnd: React.RefObject<HTMLDivElement>;
    private closeTimeout: number = -1;
    private openTimeout?: number;

    constructor(props: Props) {
        super(props);

        this.mediaElement = React.createRef();
        this.messagesEnd = React.createRef();
        this.myName = React.createRef();
        this.state = {
            hovered: false,
            onMessages: false
        }
    }

    componentDidMount() {
        const screen = this.props.user.screen
        if (this.mediaElement.current) {

            if (!this.mediaElement.current.srcObject) {
                if (screen && this.props.isActiveUser) {
                    this.mediaElement.current.srcObject = this.props.getScreenStream(this.props.user.id)!
                } else {
                    this.mediaElement.current.srcObject = this.props.getStream(this.props.user.id)!
                }
                //console.log(this.props.getStream(this.props.user.id)!)
            }

            //@ts-ignore
            if (this.mediaElement.current.setSinkId)
                //@ts-ignore
                this.mediaElement.current.setSinkId(this.props.speaker)
        }

        if (this.messagesEnd.current)
            this.messagesEnd.current.scrollIntoView({behavior: "smooth"});
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.mediaElement.current) {
            if (!this.mediaElement.current.srcObject ||
                this.props.userStream !== prevProps.userStream) {
                if (this.props.user.screen && this.props.isActiveUser) {
                    this.mediaElement.current.srcObject = this.props.user.getScreenStream()!
                } else {
                    this.mediaElement.current.srcObject = this.props.user.stream!
                }
                //console.log(this.props.getStream(this.props.user.id)!)
            }

            //@ts-ignore
            if (this.mediaElement.current.setSinkId)
                //@ts-ignore
                this.mediaElement.current.setSinkId(this.props.speaker)


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
        const audio = this.props.user.audio
        const video = this.props.user.video
        const screen = this.props.user.screen
        const scale = this.props.playgroundOffset.scale
        if (this.props.user.firstName === null)
            return (<div/>);
        const user = this.props.user
        const userSize = userProportion * scale
        const x = user.position!.x * scale
        const y = user.position!.y * scale
        const offsetX = this.props.playgroundOffset.x * scale
        const offsetY = this.props.playgroundOffset.y * scale
        let userOpacity = ((user.inProximity && audio) || this.props.selected) ? 1 : 0.5
        let userScale = (user.inProximity && audio) ? "scale(1)" : "scale(0.8)"
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

        const arem = convertRemToPixels(1)
        const sidebarWidth = 80

        if (userNamePosX < 2 * arem + sidebarWidth) {
            userNamePosX = 2 * arem + sidebarWidth
            nameOpacity = 0.45
        }
        if (userNamePosX > window.innerWidth - (arem + nameWidth)) {
            userNamePosX = window.innerWidth - (arem + nameWidth)
            nameOpacity = 0.45
        }

        if (userNamePosY < arem) {
            userNamePosY = arem
            nameOpacity = 0.45
        }
        if (userNamePosY > (document.getElementById("Playground")?.getBoundingClientRect().height ?? 0) - (arem + nameHeight)) {
            userNamePosY = (document.getElementById("Playground")?.getBoundingClientRect().height ?? 0) - (arem + nameHeight)
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
            backgroundImage: (
                (!(this.props.isActiveUser && screen) && !user.video)
                || (!this.props.user.userStream.video && !this.props.user.userStream.screen)
                || !this.mediaElement.current?.srcObject) ? `url(${user.profile_image})` : "none",
        }

        const userNameStyle = {
            left: userNamePosX,
            top: userNamePosY,
            transform: (user.inProximity && audio) ? "scale(1)" : "scale(0.8)",
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
                            anchorEl={this.mediaElement.current}
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
                                                className={"clickable ph-no-capture"}
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
                            {(this.props.user.anyStreamAvailable && !(this.props.isActiveUser && !this.props.showVideoInAvatar)) &&
                                <video data-id={(this.props.isActiveUser) ? "activeUser" : this.props.user.id}
                                       key={this.props.camera}
                                       autoPlay muted={this.props.isActiveUser}
                                       playsInline
                                       ref={this.mediaElement}
                                       onMouseOver={() => this.mouseOver()}
                                       onMouseLeave={this.mouseOut.bind(this)}
                                       className={
                                           ((!(this.props.isActiveUser && screen) && !video)) ? "profile-picture" : "" +
                                               ((user.inProximity && !this.props.isActiveUser) ? " in-proximity" : "")}/>
                            }
                            {!this.props.user.userStream &&
                                <CircularProgress className={"loader"}/>
                            }
                        </div>
                    </Tooltip>
                </div>
                <span onClick={e => {
                    e.stopPropagation()
                    this.props.center()
                }}
                      ref={this.myName} className={"clickable userName " + this.props.className}
                      style={userNameStyle}>
                    {(!user.audio) && <IoMicOffOutline/>}
                    {(!user.video) && <IoVideocamOffOutline/>}
                    {" "}
                    {(this.props.isActiveUser) ? "You" : user.firstName + " " + user.lastName}</span>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    playgroundOffset: state.playground.offset,
    userStream: ownProps.user.userStream,
    speaker: getSpeaker(state),
    camera: getCamera(state),
    microphone: getMicrophone(state),
    getStream: (id: string) => getStream(state, id),
    getScreenStream: (id: string) => getScreenStream(state, id),
    messages: getUserMessages(state, ownProps.user.id),
    showVideoInAvatar: state.playground.videoInAvatar
})

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    center: () => dispatch(centerUser(ownProps.user.user)),
    success: (s: string) => dispatch(handleSuccess(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(UserComponent)