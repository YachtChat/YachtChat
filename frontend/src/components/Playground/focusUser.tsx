import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {getStream} from "../../store/rtcSlice";
import {RootState} from "../../store/store";
import {Tooltip, Zoom} from "@material-ui/core";
import {User} from "../../store/models";
import {getUserById} from "../../store/userSlice";
import {IoCloseOutline} from "react-icons/all";

interface StateProps {
    getStream: (uid: string) => MediaStream | undefined
    user?: User
}

interface OwnProps {
    onClose: () => void
    userID?: string
}

interface State {
    ready: boolean
    fullscreen: boolean
}

type Props = OwnProps & StateProps

export class FocusUser extends Component<Props, State> {

    private videoObject: React.RefObject<HTMLVideoElement>
    private videoDiv: React.RefObject<HTMLDivElement>

    constructor(props: Props) {
        super(props);

        this.videoObject = React.createRef()
        this.videoDiv = React.createRef()

        this.state = {
            fullscreen: false,
            ready: false
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
        this.setState({ready: true})
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

    toggleFullScreen(e: React.MouseEvent) {
        e.stopPropagation()
        e.nativeEvent.stopPropagation()
        if (this.videoDiv.current &&
            !document.fullscreenElement &&
            !this.state.fullscreen)
            // If it is possible to make real fullscreen
            // else just make fullscreen whole size
            if (this.videoDiv.current?.requestFullscreen)
                this.videoDiv.current?.requestFullscreen()
            else
                this.setState({
                    fullscreen: true
                })
        else if (document.fullscreenElement) {
            // Exit fullscreen if on fullscreen
            document.exitFullscreen()
        } else if (this.state.fullscreen) {
            // Exit fullscreen if on fake fullscreen
            this.setState({
                fullscreen: false
            })
        }
    }

    render() {
        const style = {
            display: (!!this.props.userID) ? "block" : "none"
        }

        if (!!this.props.user && !this.props.user.inProximity)
            this.handleClose()

        return (
            <div onClick={e => e.stopPropagation()}>
                <Dialog open={!!this.props.userID}
                        onClick={e => e.stopPropagation()}
                        onClose={this.handleClose.bind(this)}
                        maxWidth={"lg"}
                        fullWidth={true}
                        style={style}>
                    <div className={"focus-video " +
                    ((this.state.fullscreen) ? "fullscreen" : "")}
                         onClick={e => e.stopPropagation()}>
                        <div className={"closeButton"}
                             onClick={this.handleClose.bind(this)}>
                            <IoCloseOutline/>
                        </div>
                        <div ref={this.videoDiv} className={"panel-content"}
                             onClick={this.toggleFullScreen.bind(this)}>
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
    user: (!!ownProps.userID) ? getUserById(state, ownProps.userID) : undefined
    //stream: (ownProps.userID) ? getStream(state, ownProps.userID) : undefined,
})

export default connect(mapStateToProps)(FocusUser)