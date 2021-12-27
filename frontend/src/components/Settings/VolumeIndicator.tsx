import React, {Component, CSSProperties} from 'react';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";

interface Props {
    audio?: MediaStream
    mediaChangeOngoing: boolean
    className?: string
    animateHeight?: boolean
    animateWidth?: boolean // default true
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    unit?: string // percent px
    label?: boolean // percent px
}

interface State {
    audioData: Uint8Array
}

export class MediaSettings extends Component<Props, State> {

    audioContext: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    dataArray: Uint8Array | null = null;
    source: MediaStreamAudioSourceNode | null = null;
    rafID: number = -1;

    constructor(props: Props) {
        super(props);
        this.state = {audioData: new Uint8Array(0)};
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.mountStream()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps !== this.props && !this.props.mediaChangeOngoing) {
            this.unmountStream()
            this.mountStream()
        }
    }

    mountStream() {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        if (this.props.audio) {
            this.source = this.audioContext!.createMediaStreamSource(this.props.audio);
            this.source.connect(this.analyser);
        }
        this.rafID = requestAnimationFrame(this.tick);
    }

    componentWillUnmount() {
        this.unmountStream()
    }

    unmountStream() {
        cancelAnimationFrame(this.rafID);
        if (this.analyser)
            this.analyser.disconnect();
        if (this.source)
            this.source.disconnect();
    }

    tick() {
        if (this.analyser && this.dataArray) {
            this.analyser.getByteTimeDomainData(this.dataArray);
            this.setState({audioData: this.dataArray});
            this.rafID = requestAnimationFrame(this.tick);
        }
    }

    render() {
        let bufferSize = 0
        if (this.analyser)
            bufferSize = this.state.audioData.length

        let volume = 0
        this.state.audioData.forEach((v, idx) => (bufferSize > idx) ? volume += Math.sqrt(Math.pow(v - 128, 2)) / 64 : 0)

        volume /= bufferSize

        const animateHeight = !!this.props.animateHeight
        const animateWidth = this.props.animateWidth === undefined || this.props.animateWidth // default to true

        const unit = this.props.unit ?? "%"
        const minWidth = this.props.minWidth ?? 0
        const maxWidth = this.props.maxWidth ?? 100
        const minHeight = this.props.minWidth ?? 0
        const maxHeight = this.props.maxHeight ?? 100
        const width = (maxWidth - minWidth) * volume + minWidth
        const height = (maxHeight - minHeight) * volume + minHeight

        return (
            <div className={this.props.className}>
                {this.props.label &&
                    <label>Volume</label>
                }
                <div className={"volumeIndicator"}>
                    <div className={"volume"}
                         style={{
                             width: animateWidth ? `${width}${unit}` : undefined, // Use animate width by standard
                             height: animateHeight ? `${height}${unit}` : undefined
                         }}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    mediaChangeOngoing: state.rtc.mediaChangeOngoing,
})

export default connect(mapStateToProps)(MediaSettings)