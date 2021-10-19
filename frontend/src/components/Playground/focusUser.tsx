import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {getStream} from "../../store/rtcSlice";
import {RootState} from "../../store/store";
import {Tooltip, Zoom} from "@material-ui/core";

interface StateProps {
    getStream: (uid: string) => MediaStream | undefined
}

interface OwnProps {
    onClose: () => void
    userID?: string
}

interface State {
    ready: boolean
}

type Props = OwnProps & StateProps

export class FocusUser extends Component<Props, State> {

    private videoObject: React.RefObject<HTMLVideoElement>
    private videoDiv: React.RefObject<HTMLDivElement>

    constructor(props: Props) {
        super(props);

        this.videoObject = React.createRef()
        this.videoDiv = React.createRef()
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
            this.setState({ready: false})
        }
    }

    render() {
        const style = {
            display: (!!this.props.userID) ? "block" : "none"
        }


        return (
            <div onClick={e => e.stopPropagation()}>
                <Dialog open={!!this.props.userID}
                        onClick={e => e.stopPropagation()}
                        onClose={this.handleClose.bind(this)}
                        fullWidth={true}
                        style={style}>
                    <div className={"panel"}
                         onClick={e => e.stopPropagation()}>
                        <div ref={this.videoDiv} className={"panelContent"}>
                            <Tooltip TransitionComponent={Zoom} disableFocusListener
                                     title={"Click for fullscreen"} placement="top" arrow>
                                <video autoPlay muted
                                       playsInline
                                       onClick={e => {
                                           e.stopPropagation()
                                           if (this.videoDiv.current)
                                               this.videoDiv.current?.requestFullscreen()
                                       }}
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
    //stream: (ownProps.userID) ? getStream(state, ownProps.userID) : undefined,
})

export default connect(mapStateToProps)(FocusUser)