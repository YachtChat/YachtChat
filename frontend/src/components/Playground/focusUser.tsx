import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {getStream} from "../../store/rtcSlice";
import {RootState} from "../../store/store";
import {Tooltip, Zoom} from "@material-ui/core";

interface StateProps {
    stream?: MediaStream
    mediaChangeOngoing: boolean
}

interface OwnProps {
    onClose: () => void
    userID?: string
}

interface State {
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

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.stream && this.videoObject.current && !this.props.mediaChangeOngoing) {

            if (!this.videoObject.current.srcObject ||
                this.props.mediaChangeOngoing !== prevProps.mediaChangeOngoing) {
                this.videoObject.current.srcObject = this.props.stream!
            }
        }
    }

    handleClose() {
        this.setState({
            userid: ""
        })
        this.props.onClose()
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
                        maxWidth={"xl"}
                        style={style}>
                    <div className={"panel"}
                         onClick={e => e.stopPropagation()}>
                        <div ref={this.videoDiv} className={"panelContent"}>
                            <Tooltip TransitionComponent={Zoom} disableFocusListener
                                     title={"Click for fullscreen"} placement="top" arrow>
                                <video autoPlay muted onClick={e => {
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
    stream: (ownProps.userID) ? getStream(state, ownProps.userID) : undefined,
    mediaChangeOngoing: state.rtc.mediaChangeOngoing
})

export default connect(mapStateToProps)(FocusUser)