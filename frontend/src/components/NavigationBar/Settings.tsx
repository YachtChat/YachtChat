import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {
    changeAudioInput,
    changeAudioOutput,
    changeVideoInput,
    getCamera,
    getMediaDevices,
    getMicrophone,
    getSpeaker,
    getStream,
    loadAllMediaDevices
} from "../../store/rtcSlice";
import {User} from "../../store/models";

interface Props {
    user: User
    open: boolean
    onClose: (event: React.MouseEvent) => void
    loadMedia: () => void
    microphones: string[]
    cameras: string[]
    speakers: string[]
    microphone: string
    camera: string
    speaker: string
    cameraChangeOngoing: boolean
    changeVideoInput: (camera: string) => void
    changeAudioOutput: (speaker: string) => void
    changeAudioInput: (microphone: string) => void
}

export class Settings extends Component<Props> {

    componentDidMount() {
        this.props.loadMedia()
    }

    render() {
        const mediaDevices = getMediaDevices()
        return (
            <div>
                <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Settings</DialogTitle>
                    <DialogContent className={"settings"}>
                        <div className={"videoPreview"}>
                            <video key={this.props.camera} autoPlay muted ref={ref => {
                                if (ref && !this.props.cameraChangeOngoing)
                                    ref.srcObject = getStream(this.props.user.id)
                            }}/>
                        </div>
                        <div className={"settings-item"}>
                            <label>
                                Change Video Input
                            </label>
                            <div className="dropdown">
                                <select value={this.props.camera}
                                        onChange={({target: {value}}) => this.props.changeVideoInput(value)}
                                        className="videodevices" name="videodevices">
                                    {this.props.cameras.map(c => (
                                        <option key={c} value={c}>
                                            {getMediaDevices()[c].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={"settings-item"}>
                            <label>
                                Change Audio Input
                            </label>
                            <div className="dropdown">
                                {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                                <select value={this.props.microphone}
                                        onChange={({target: {value}}) => this.props.changeAudioInput(value)}
                                        className="audiodevices" name="audiodevices">
                                    {this.props.microphones.map(c => (
                                        <option key={c} value={c}>
                                            {getMediaDevices()[c].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={"settings-item"}>
                            <label>
                                Change Audio Output
                            </label>
                            <div className="dropdown">
                                {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                                <select value={this.props.speaker}
                                        onChange={({target: {value}}) => this.props.changeAudioOutput(value)}
                                        className="audiodevices" name="audiodevices">
                                    {this.props.speakers.map(c => (
                                        <option key={c} value={c}>
                                            {getMediaDevices()[c].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button onClick={this.props.onClose} className={"settingsButton"}>
                            done
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
    microphones: state.rtc.microphones,
    cameras: state.rtc.cameras,
    cameraChangeOngoing: state.rtc.cameraChangeOngoing,
    speakers: state.rtc.speakers,
    microphone: getMicrophone(state),
    camera: getCamera(state),
    speaker: getSpeaker(state),
})

const mapDispatchToProps = (dispatch: any) => ({
    loadMedia: () => dispatch(loadAllMediaDevices()),
    changeVideoInput: (camera: string) => dispatch(changeVideoInput(camera)),
    changeAudioOutput: (speaker: string) => dispatch(changeAudioOutput(speaker)),
    changeAudioInput: (microphone: string) => dispatch(changeAudioInput(microphone)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)