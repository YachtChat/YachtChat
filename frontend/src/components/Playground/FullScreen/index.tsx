import React, {Component} from 'react';
import {connect} from "react-redux";
import {getStream} from "../../../store/mediaSlice";
import {RootState} from "../../../store/utils/store";
import {getOnlineUsersWrapped, getUserByIdWrapped} from "../../../store/userSlice";
import {IoCloseOutline} from "react-icons/io5";
import Sidebar from "../Sidebar";
import {UserWrapper} from "../../../store/model/UserWrapper";
import {Collapse, Tooltip} from "@mui/material";
import {Video} from "./Video";
import {TransitionGroup} from "react-transition-group";

interface StateProps {
    getStream: (uid: string) => MediaStream | undefined
    user?: UserWrapper
    spaceID: string
    online?: boolean
    inRange?: boolean
    dnd?: boolean
    users: UserWrapper[]
    focus: (id: string | undefined) => void
}

interface OwnProps {
    onClose: () => void
    userID?: string
}

interface State {
    ready: boolean
    fullscreen: boolean
    idle: boolean
    onSidebar: boolean
}

type Props = OwnProps & StateProps

class FullScreen extends Component<Props, State> {

    private videoObject: React.RefObject<HTMLVideoElement>
    private videoDiv: React.RefObject<HTMLDivElement>
    private timer: number = -1

    constructor(props: Props) {
        super(props);

        this.videoObject = React.createRef()
        this.videoDiv = React.createRef()

        this.state = {
            fullscreen: false,
            ready: false,
            idle: false,
            onSidebar: false
        }
    }

    componentWillUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (!!this.videoObject.current && !!this.props.userID) {
            if (!this.videoObject.current.srcObject ||
                prevProps.userID !== this.props.userID) {
                this.mountStream()
            }
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (!!this.videoObject.current && !!this.props.userID) {
            //window.alert(prevProps.userID !== this.props.userID)
            if (!this.videoObject.current.srcObject) {
                this.mountStream()
                this.videoObject.current.id = this.props.userID
            }
        }
        if (prevProps.userID !== this.props.userID) {
            this.forceUpdate(() => {
                this.mountStream()
            })
        }
    }

    componentDidMount() {
        this.mountStream()
        this.setState({
            ready: true,
            idle: false
        })
        this.resetTimer()
        this.toggleFullScreen()
    }

    mountStream() {
        if (!!this.videoObject.current && !!this.props.userID) {
            const stream = this.props.getStream(this.props.userID)
            if (stream)
                this.videoObject.current.srcObject = stream
        }
    }

    handleClose() {
        this.props.onClose()

        if (!!this.videoObject.current && !this.props.userID) {
            this.videoObject.current.srcObject = null

            this.videoObject.current.id = ""
            this.setState({
                ready: false,
                fullscreen: false
            })

            // close fullscreen if enabled
            if (document.fullscreenElement)
                document.exitFullscreen()
        }
    }

    toggleFullScreen(e?: React.MouseEvent) {
        if (e) {
            e.stopPropagation()
            e.nativeEvent.stopPropagation()
        }
        if (this.videoDiv.current &&
            !document.fullscreenElement &&
            !this.state.fullscreen) {
            // If it is possible to make real fullscreen
            // else just make fullscreen whole size
            if (this.videoDiv.current?.requestFullscreen) {
                this.videoDiv.current?.requestFullscreen()
            }
            this.setState({
                fullscreen: true,
                idle: false
            })
            this.resetTimer()
        } else if (this.state.fullscreen) {
            // Exit fullscreen if on fake fullscreen
            this.setState({
                fullscreen: false
            })

            // Exit fullscreen and close
            this.handleClose()
        }
    }

    // Reset idle time
    mouseDidMove() {
        this.setState({
            idle: false
        })
        if (!this.state.onSidebar)
            this.resetTimer()
    }

    // Reset timer for the idle time
    resetTimer() {
        this.setState({
            onSidebar: false
        })
        clearTimeout(this.timer)
        this.timer = window.setTimeout(() => {
            this.setState({
                idle: true,
            })
        }, 2000)
    }

    removeTimer() {
        if (this.timer !== -1)
            clearTimeout(this.timer)
        this.timer = -1
        this.setState({
            idle: false,
            onSidebar: true
        })
    }

    keyPress(e: React.KeyboardEvent) {
        if (this.state.fullscreen && e.key === "Escape") {
            this.toggleFullScreen()
        }
    }

    render() {
        const style = {
            display: (!!this.props.userID) ? "block" : "none",
            zIndex: 10001
        }

        if (!this.props.user || !this.props.inRange || !this.props.online || this.props.dnd)
            this.handleClose()

        return (
            <div onClick={e => e.stopPropagation()}>

                <div style={style} className={"focus-video " +
                    ((this.state.fullscreen) ? "fullscreen" : "")}
                     onMouseDown={e => e.stopPropagation()}
                     onKeyPress={this.keyPress.bind(this)}
                     onMouseMove={this.mouseDidMove.bind(this)}>
                    <div ref={this.videoDiv} className={"panel-content"}
                         onClick={this.toggleFullScreen.bind(this)}>
                        <div className={"closeButton " + ((this.state.idle) ? "idle" : "")}
                             onClick={e => {
                                 e.stopPropagation()
                                 this.handleClose()
                             }}>
                            <IoCloseOutline/>
                        </div>
                        <div onClick={e => {
                            e.stopPropagation()
                            e.nativeEvent.stopPropagation()
                        }}>
                            {this.state.fullscreen &&
                                <>
                                    <Sidebar minimal spaceID={this.props.spaceID}
                                             className={(this.state.idle) ? "idle" : ""}
                                             onMouseEnter={this.removeTimer.bind(this)}
                                             onMouseLeave={this.resetTimer.bind(this)}>
                                        <div className={"otherUserWrapper"}>
                                            <TransitionGroup>
                                                {this.props.users.map(u =>
                                                    <Collapse in={u.inRange}>
                                                        <Tooltip title={u.firstName + " " + u.lastName} arrow>
                                                            <Video key={u.id} onClick={() => this.props.focus(u.id)}
                                                                   className={"otherUser"} stream={u.stream}/>
                                                        </Tooltip>
                                                    </Collapse>
                                                )}
                                            </TransitionGroup>
                                        </div>
                                    </Sidebar>
                                </>
                            }
                        </div>
                        <video autoPlay muted
                               playsInline
                               className={"video"}
                               ref={this.videoObject}/>
                        {this.state.fullscreen &&
                            <span className={"name " + ((this.state.idle) ? "idle" : "")}>
                                {this.props.user?.firstName + " " + this.props.user?.lastName}
                            </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    getStream: (uid: string) => getStream(state, uid),
    user: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID) : undefined,
    online: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID).online : undefined,
    inRange: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID).inRange : undefined,
    dnd: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID).doNotDisturb : undefined,
    users: getOnlineUsersWrapped(state).filter(u => u.inRange && !u.doNotDisturb && u.id !== ownProps.userID)
    //stream: (ownProps.userID) ? getStream(state, ownProps.userID) : undefined,
})

export default connect(mapStateToProps)(FullScreen)