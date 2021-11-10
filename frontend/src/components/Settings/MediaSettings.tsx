import React, {Component} from 'react';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {
    changeAudioInput,
    changeAudioOutput,
    changeVideoInput,
    changeVirtualBackground,
    getCamera,
    getFreshMediaStream,
    getMediaDevices,
    getMicrophone,
    getSpeaker,
    handleInputChange,
    loadAllMediaDevices
} from "../../store/rtcSlice";
import {User} from "../../store/models";
import VolumeIndicator from "./VolumeIndicator";
import {applyVirtualBackground, stopAllVideoEffects} from "../../store/utils";
import CameraProcessor from "camera-processor";

interface Props {
    user: User
    loadMedia: () => void
    microphones: string[]
    cameras: string[]
    speakers: string[]
    microphone: string
    camera: string
    speaker: string
    virtualBackground: string | undefined
    mediaChangeOngoing: boolean
    changeVideoInput: (camera: string) => void
    changeAudioOutput: (speaker: string) => void
    changeAudioInput: (microphone: string) => void
    changeVirtualBackground: (background: string) => void
    requestUserMedia: () => void
    getStream: () => Promise<MediaStream>
}

export class MediaSettings extends Component<Props> {

    stream?: MediaStream
    cam?: CameraProcessor

    componentDidMount() {
        this.props.loadMedia()
        this.props.getStream().then(stream => {
            const [str, cam] = applyVirtualBackground(stream, this.props.virtualBackground)
            this.stream = str
            this.cam = cam
            this.forceUpdate()
        })
    }

    retryUserMedia() {
        this.props.requestUserMedia()
        this.props.loadMedia()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.mediaChangeOngoing !== prevProps.mediaChangeOngoing &&
            (prevProps.camera !== this.props.camera || prevProps.virtualBackground !== this.props.virtualBackground)) {
            this.props.getStream().then(stream => {
                if (this.stream)
                    this.stream.getTracks().forEach(t => t.stop())
                const [str, cam] = applyVirtualBackground(stream, this.props.virtualBackground, this.cam)
                this.stream = str
                this.cam = cam
                this.forceUpdate()
            })
        }
    }

    componentWillUnmount() {
        this.stream?.getTracks().forEach(t => t.stop())
        stopAllVideoEffects(this.cam)
        this.cam = undefined
        this.stream = undefined
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

        const virtualBackgrounds = ["blur", "yacht", "transparent", "none"]

        return (
            <div className={"mediaSettings"}>
                <div className={"videoPreview"}>
                    <video key={this.props.camera} autoPlay muted ref={ref => {
                        if (ref && !this.props.mediaChangeOngoing && this.stream)
                            ref.srcObject = this.stream
                    }}/>
                </div>
                <VolumeIndicator audio={this.stream}/>
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
                {/*{this.props.cameras.length !== 0 &&*/}
                {/*<div className={"settings-item"}>*/}
                {/*    <label>*/}
                {/*        Virtual Background*/}
                {/*    </label>*/}
                {/*    <div className="dropdown">*/}
                {/*        /!*<label htmlFor="spaces">Choose a Space:</label>*!/*/}
                {/*        <select value={this.props.virtualBackground}*/}
                {/*                onChange={({target: {value}}) => this.props.changeVirtualBackground(value)}*/}
                {/*                className="audiodevices" name="audiodevices">*/}
                {/*            {virtualBackgrounds.map(c => (*/}
                {/*                <option key={c} value={c}>*/}
                {/*                    {c[0].toUpperCase() + c.slice(1)}*/}
                {/*                </option>*/}
                {/*            ))}*/}
                {/*        </select>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*}*/}
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
    virtualBackground: state.rtc.selected.virtualBackground,
    getStream: () => getFreshMediaStream(state),
})

const mapDispatchToProps = (dispatch: any) => ({
    loadMedia: () => dispatch(loadAllMediaDevices()),
    changeVideoInput: (camera: string) => dispatch(changeVideoInput(camera)),
    changeAudioOutput: (speaker: string) => dispatch(changeAudioOutput(speaker)),
    changeAudioInput: (microphone: string) => dispatch(changeAudioInput(microphone)),
    changeVirtualBackground: (background: string) => dispatch(changeVirtualBackground(background)),
    requestUserMedia: () => dispatch(handleInputChange()),
})

export default connect(mapStateToProps, mapDispatchToProps)(MediaSettings)