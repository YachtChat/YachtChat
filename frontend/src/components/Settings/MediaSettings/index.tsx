import React, {Component} from 'react';
import {RootState} from "../../../store/utils/store";
import {connect} from "react-redux";
import "../style.scss";
import {
    changeAudioInput,
    changeAudioOutput,
    changeVideoInput,
    changeVirtualBackground,
    getCamera,
    getMediaDevices,
    getMicrophone,
    getSpeaker,
    handleInputChange,
    loadAllMediaDevices
} from "../../../store/mediaSlice";
import {User} from "../../../store/model/model";
import Preview from "./Preview";

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
    changeVideoInput: (camera: string) => void
    changeAudioOutput: (speaker: string) => void
    changeAudioInput: (microphone: string) => void
    changeVirtualBackground: (background: string) => void
    requestUserMedia: () => void
}

class MediaSettings extends Component<Props> {

    componentDidMount() {
        this.props.loadMedia()
    }

    render() {
        const mediaDevices = getMediaDevices()

        const virtualBackgrounds = ["blur", "yacht", "transparent", "none"]

        return (
            <div className={"mediaSettings"}>
                <Preview video={true} audio={true} />
                <div className={"toggles"}>
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

                    {// If cameras are loaded and Workers as well as canvas filters are supported
                        (this.props.cameras.length !== 0 && window.Worker && typeof OffscreenCanvas !== "undefined" &&
                            document.createElement('canvas').getContext('2d')?.filter) &&
                        <div className={"settings-item"}>
                            <label>
                                Virtual Background
                            </label>
                            <div className="dropdown">
                                {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                                <select value={this.props.virtualBackground}
                                        onChange={({target: {value}}) => this.props.changeVirtualBackground(value)}
                                        className="audiodevices" name="audiodevices">
                                    {virtualBackgrounds.map(c => (
                                        <option key={c} value={c}>
                                            {c[0].toUpperCase() + c.slice(1)}
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
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
    microphones: state.media.microphones,
    cameras: state.media.cameras,
    speakers: state.media.speakers,
    microphone: getMicrophone(state),
    camera: getCamera(state),
    speaker: getSpeaker(state),
    virtualBackground: state.media.selected.virtualBackground,
})

const mapDispatchToProps = (dispatch: any) => ({
    loadMedia: () => dispatch(loadAllMediaDevices()),
    changeVideoInput: (camera: string) => dispatch(changeVideoInput(camera)),
    changeAudioOutput: (speaker: string) => dispatch(changeAudioOutput(speaker)),
    changeAudioInput: (microphone: string) => dispatch(changeAudioInput(microphone)),
    changeVirtualBackground: (background: string) => dispatch(changeVirtualBackground(background)),
    requestUserMedia: () => dispatch(handleInputChange(true, true)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MediaSettings)