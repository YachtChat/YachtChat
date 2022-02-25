import React, {Component} from "react";
import {PlaygroundOffset} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import {getUserWrapped, maxRange, userProportion} from "../../store/userSlice";
import {getStream} from "../../store/mediaSlice";
import VolumeIndicator from "../Settings/VolumeIndicator";
import {UserWrapper} from "../../store/model/UserWrapper";

interface Props {
    user: UserWrapper
    selected?: boolean
    isActiveUser?: boolean
    playgroundOffset: PlaygroundOffset
    audio: boolean
    getStream: (id: string) => MediaStream | undefined,
    className?: string
    showVolumeIndicators: boolean
}

export class RangeComponent extends Component<Props> {
    render() {
        const scale = this.props.playgroundOffset.scale
        if (this.props.user.firstName === null)
            return (<div/>);

        const user = this.props.user
        const userSize = userProportion * scale
        const x = user.position!.x * scale
        const y = user.position!.y * scale
        const offsetX = this.props.playgroundOffset.x * scale
        const offsetY = this.props.playgroundOffset.y * scale

        // range in pixels
        const rangeInPx = 2 * maxRange * user.position!.range / 100 * scale + userSize

        const rangeStyle = {
            width: rangeInPx,
            height: rangeInPx,
            left: x - rangeInPx / 2 - offsetX,
            top: y - rangeInPx / 2 - offsetY,
            opacity: (user.inProximity && this.props.audio) ? 1 : 0.5,
            borderColor: (this.props.isActiveUser) ? "red" : "green",
        }

        return (
            <div className={((this.props.isActiveUser) ? "activeUser" : "")}>
                <div className={"userRange " + this.props.className} style={rangeStyle}>
                    {this.props.showVolumeIndicators &&
                    <VolumeIndicator
                        className={"speakingIndicator " + (!user.audio ? "mute" : "")}
                        animateHeight
                        proximityWarning
                        audio={this.props.getStream(this.props.user.id)}
                        minWidth={!user.inProximity && user.audio ? userSize * 0.8 : userSize * 0.99}
                        minHeight={!user.inProximity && user.audio ? userSize * 0.8 : userSize * 0.99}
                        maxWidth={userSize * 2}
                        maxHeight={userSize * 2}
                        unit={"px"}
                    />
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    playgroundOffset: state.playground.offset,
    showVolumeIndicators: state.playground.showVolumeIndicators,
    audio: getUserWrapped(state).audio,
    getStream: (id: string): MediaStream | undefined => getStream(state, id),
})

export default connect(mapStateToProps)(RangeComponent)