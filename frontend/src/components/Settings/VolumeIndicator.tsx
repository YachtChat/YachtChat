import React, {Component} from 'react';
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import "./style.scss";
import {getOnlineUsers} from "../../store/userSlice";
import {User} from "../../store/model/model";

interface Props {
    audio?: MediaStream
    className?: string
    animateHeight?: boolean
    animateWidth?: boolean // default true
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    unit?: string // percent px
    label?: boolean // percent px
    users: User[]
    proximityWarning?: boolean
}

interface State {
    audioData: Uint8Array
    showWarning: boolean
}

export class MediaSettings extends Component<Props, State> {

    audioContext: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    dataArray: Uint8Array | null = null;
    source: MediaStreamAudioSourceNode | null = null;
    rafID: number = -1;
    timer: number = -1;

    constructor(props: Props) {
        super(props);
        this.state = {
            audioData: new Uint8Array(0),
            showWarning: false,
        };
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.mountStream()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps !== this.props) {
            this.unmountStream()
            this.mountStream()
        }
    }

    mountStream() {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        if (this.props.audio && this.props.audio.getAudioTracks().length > 0) {
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


        if (this.props.proximityWarning &&
            volume > 0.5 &&
            this.props.users.length > 0 &&
            this.props.users.filter(u => u.inProximity).length === 0) {
            clearTimeout(this.timer)
            this.timer = window.setTimeout(() => {
                this.setState({
                    showWarning: false
                })
            }, 2000)
            if (this.state.showWarning)
                this.setState({
                    showWarning: true
                })
        }

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
    users: getOnlineUsers(state),
})

export default connect(mapStateToProps)(MediaSettings)