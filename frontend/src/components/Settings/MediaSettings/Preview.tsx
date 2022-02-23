import React, {Component} from 'react';
import {RootState} from "../../../store/utils/store";
import {connect} from "react-redux";
import "../style.scss";
import {
    getCamera,
    getFreshMediaStream,
    getMicrophone,
    handleInputChange,
    loadAllMediaDevices
} from "../../../store/mediaSlice";
import VolumeIndicator from "../VolumeIndicator";
import {applyVirtualBackground, stopAllVideoEffects} from "../../../store/utils/utils";
import CameraProcessor from "camera-processor";
import {Video} from "../../Playground/FullScreen/Video";
import {Collapse} from "@mui/material";

interface Props {
    video: boolean
    audio: boolean
    loadMedia: () => void
    microphones: string[]
    cameras: string[]
    speakers: string[]
    camera: string
    microphone: string
    virtualBackground: string | undefined
    requestUserMedia: () => void
    getStream: (video: boolean, audio: boolean) => Promise<MediaStream>
}

class Preview extends Component<Props> {

    stream?: MediaStream
    cam?: CameraProcessor

    componentDidMount() {
        this.props.loadMedia()
        this.props.getStream(this.props.video, this.props.audio).then(stream => {
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

    componentWillUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if ((prevProps.camera !== this.props.camera ||
            prevProps.microphone !== this.props.microphone ||
            prevProps.audio !== this.props.audio ||
            prevProps.video !== this.props.video ||
            prevProps.virtualBackground !== this.props.virtualBackground)) {
            if (this.stream) {
                this.stream.getTracks().forEach(t => t.stop())
                this.stream = undefined
            }
            this.props.getStream(this.props.video, this.props.audio).then(stream => {
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
            <div className={"preview"}>
                <Collapse key={this.props.camera + this.props.virtualBackground}
                          in={this.props.video && (this.stream?.getVideoTracks().length ?? 0) > 0} unmountOnExit>
                    <Video stream={this.stream}
                           className={"videoPreview"}/>
                </Collapse>
                <Collapse in={this.props.audio && (this.stream?.getAudioTracks().length ?? 0) > 0} unmountOnExit>
                    <VolumeIndicator className={"settings-item"} audio={this.stream} label/>
                </Collapse>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    microphones: state.media.microphones,
    cameras: state.media.cameras,
    speakers: state.media.speakers,
    microphone: getMicrophone(state),
    camera: getCamera(state),
    virtualBackground: state.media.selected.virtualBackground,
})

const mapDispatchToProps = (dispatch: any) => ({
    loadMedia: () => dispatch(loadAllMediaDevices()),
    requestUserMedia: () => dispatch(handleInputChange(true, true)),
    getStream: (video: boolean, audio: boolean) => dispatch(getFreshMediaStream(video, audio))
})

export default connect(mapStateToProps, mapDispatchToProps)(Preview)