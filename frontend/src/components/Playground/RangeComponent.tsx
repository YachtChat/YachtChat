import React, {Component} from "react";
import {PlaygroundOffset, User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {maxRange, userProportion} from "../../store/userSlice";

interface Props {
    user: User
    selected: boolean
    isActiveUser: boolean
    playgroundOffset: PlaygroundOffset
    muted: boolean
}

export class RangeComponent extends Component<Props> {
    render() {
        const scale = this.props.playgroundOffset.scale
        if (this.props.user.name === null)
            return (<div/>);

        const user = this.props.user
        const userSize = userProportion * scale
        const x = user.position.x * scale
        const y = user.position.y * scale
        const offsetX = this.props.playgroundOffset.x * scale
        const offsetY = this.props.playgroundOffset.y * scale

        // range in pixels
        const rangeInPx = 2 * maxRange * user.position.range * scale + userSize

        const rangeStyle = {
            width: rangeInPx,
            height: rangeInPx,
            left: x - rangeInPx / 2 - offsetX,
            top: y - rangeInPx / 2 - offsetY,
            opacity: (!!user.inProximity && !this.props.muted) ? 1 : 0.5,
            borderColor: (this.props.isActiveUser) ? "red" : "green",
        }

        return (
            <div className={(this.props.isActiveUser) ? "activeUser" : ""}>
                <div className={"userRange"} style={rangeStyle}/>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    playgroundOffset: state.playground.offset,
    muted: state.rtc.muted
})

export default connect(mapStateToProps)(RangeComponent)