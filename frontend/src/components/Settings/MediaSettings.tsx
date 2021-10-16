import React, {Component} from 'react';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {
    changeAudioInput,
    changeAudioOutput,
    changeVideoInput,
    getCamera,
    getMediaDevices,
    getMicrophone,
    getSpeaker,
    getStream,
    handleInputChange,
    loadAllMediaDevices
} from "../../store/rtcSlice";
import {User} from "../../store/models";
import VolumeIndicator from "./VolumeIndicator";

interface Props {
    user: User
    loadMedia: () => void
    microphones: string[]
    cameras: string[]
    speakers: string[]
    microphone: string
    camera: string
    speaker: string
    mediaChangeOngoing: boolean
    changeVideoInput: (camera: string) => void
    changeAudioOutput: (speaker: string) => void
    changeAudioInput: (microphone: string) => void
    requestUserMedia: () => void
    getStream: (id: string) => MediaStream | undefined
}

export class MediaSettings extends Component<Props> {

    componentDidMount() {
        this.props.loadMedia()
    }

    retryUserMedia() {
        this.props.requestUserMedia()
        this.props.loadMedia()
    }

    render() {
        const mediaDevices = getMediaDevices()

        if (this.props.speakers.length === 0 && this.props.microphones.length === 0 && this.props.cameras.length === 0) {
            return (<div className={"no-media"}>
                <div>
                    No media devices found. <br/>Request media again?
                </div>
                <button onClick={this.retryUserMedia.bind(this)}>
                    Request media devices
                </button>
            </div>)
        }

        return (
            <div className={"mediaSettings"}>
                <div className={"videoPreview"}>
                    <video key={this.props.camera} autoPlay muted ref={ref => {
                        if (ref && !this.props.mediaChangeOngoing && this.props.getStream(this.props.user.id))
                            ref.srcObject = this.props.getStream(this.props.user.id)!
                    }}/>
                </div>
                <VolumeIndicator/>
                {this.props.cameras.length !== 0 &&
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
                                    {mediaDevices[c].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                }
                {this.props.microphones.length !== 0 &&
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
                                    {mediaDevices[c].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                }
                {this.props.speakers.length !== 0 &&
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
                                    {mediaDevices[c].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
    microphones: state.rtc.microphones,
    cameras: state.rtc.cameras,
    mediaChangeOngoing: state.rtc.mediaChangeOngoing,
    speakers: state.rtc.speakers,
    microphone: getMicrophone(state),
    camera: getCamera(state),
    speaker: getSpeaker(state),
    getStream: (id: string) => getStream(state, id),
})

const mapDispatchToProps = (dispatch: any) => ({
    loadMedia: () => dispatch(loadAllMediaDevices()),
    changeVideoInput: (camera: string) => dispatch(changeVideoInput(camera)),
    changeAudioOutput: (speaker: string) => dispatch(changeAudioOutput(speaker)),
    changeAudioInput: (microphone: string) => dispatch(changeAudioInput(microphone)),
    requestUserMedia: () => dispatch(handleInputChange()),
})

export default connect(mapStateToProps, mapDispatchToProps)(MediaSettings)