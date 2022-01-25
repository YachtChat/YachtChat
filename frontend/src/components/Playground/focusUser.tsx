import React, {Component} from 'react';
import {connect} from "react-redux";
import {getStream} from "../../store/mediaSlice";
import {RootState} from "../../store/utils/store";
import {getUserByIdWrapped} from "../../store/userSlice";
import {IoCloseOutline} from "react-icons/all";
import Sidebar from "./Sidebar";
import {UserWrapper} from "../../store/model/UserWrapper";
import {Dialog, Tooltip, Zoom} from "@mui/material";

interface StateProps {
    getStream: (uid: string) => MediaStream | undefined
    user?: UserWrapper
    spaceID: string
    online?: boolean
    inRange?: boolean
}

interface OwnProps {
    onClose: () => void
    userID?: string
}

interface State {
    ready: boolean
    fullscreen: boolean
    idle: boolean
}

type Props = OwnProps & StateProps

export class FocusUser extends Component<Props, State> {

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
            idle: false
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

            if (document.fullscreenElement) {
                // Exit fullscreen if on fullscreen
                this.handleClose()
            }
        }
    }

    // Reset idle time
    mouseDidMove() {
        this.setState({
            idle: false
        })
        this.resetTimer()
    }

    // Reset timer for the idle time
    resetTimer() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            this.setState({
                idle: true
            })
        }, 2000)
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

        if (!this.props.user || !this.props.inRange || !this.props.online)
            this.handleClose()

        return (
            <div onClick={e => e.stopPropagation()}>
                <Dialog open={!!this.props.userID}
                        onMouseDown={e => e.stopPropagation()}
                        onClose={this.handleClose.bind(this)}
                        onBackdropClick={this.handleClose.bind(this)}
                        maxWidth={"lg"}
                        onKeyPress={this.keyPress.bind(this)}
                        onMouseMove={this.mouseDidMove.bind(this)}
                        fullWidth={true}
                        style={style}>
                    <div className={"focus-video " +
                        ((this.state.fullscreen) ? "fullscreen" : "")}>
                        <div ref={this.videoDiv} className={"panel-content"}
                             onClick={this.toggleFullScreen.bind(this)}>
                            <div className={"closeButton " + ((this.state.idle) ? "idle" : "")}
                                 onClick={e => {
                                     e.stopPropagation()
                                     this.handleClose()
                                 }}>
                                <IoCloseOutline />
                            </div>
                            <div onClick={e => {
                                e.stopPropagation()
                                e.nativeEvent.stopPropagation()
                            }}>
                                {this.state.fullscreen &&
                                    <Sidebar minimal spaceID={this.props.spaceID}
                                             className={(this.state.idle) ? "idle" : ""}/>
                                }
                            </div>
                            <Tooltip TransitionComponent={Zoom} disableFocusListener
                                     title={"Click for fullscreen"} placement="top" arrow>
                                <video autoPlay muted
                                       playsInline
                                       className={"video"}
                                       ref={this.videoObject}/>
                            </Tooltip>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    getStream: (uid: string) => getStream(state, uid),
    user: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID) : undefined,
    online: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID).online : undefined,
    inRange: (!!ownProps.userID) ? getUserByIdWrapped(state, ownProps.userID).inRange : undefined
    //stream: (ownProps.userID) ? getStream(state, ownProps.userID) : undefined,
})

export default connect(mapStateToProps)(FocusUser)