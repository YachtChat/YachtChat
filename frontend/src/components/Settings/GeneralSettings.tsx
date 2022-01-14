import React from "react";
import {Tooltip} from "@material-ui/core";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import {setShowVolumeIndicators, setVideoInAvatar} from "../../store/playgroundSlice";
import TurnOffCamera from "./TurnOffCamera";

interface Props {
    emailNotifications: boolean
    videoInAvatar: boolean,
    showVolumeIndicators: boolean

    setShowVolumeIndicators: (s: boolean) => void
    setVideoInAvatar: (s: boolean) => void
}

export function GeneralSettings(props: Props) {
    return (
        <div className={"mediaSettings"}>
            <div className={"toggles"}>
                <Tooltip title={
                    "To know when your team is online get notified when the first person joins a space."
                } arrow interactive placement={"top"}>
                    <div className={"settings-item"}
                         onClick={() =>
                             alert("This feature is not available yet")
                         }>
                        <label>
                            Send email notification when first user joins space
                        </label>
                        <div className="dropdown">
                            <select disabled
                                //onChange={({target: {value}}) => this.props.changeVideoInput(value)}
                                    name="volumeindicators">
                                <option value={"false"}>
                                    No
                                </option>
                                <option value={"true"}>
                                    Yes
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
                <Tooltip title={
                    "Volume Indicators are a great way to show who is speaking. " +
                    "To save computing power you can disable them."
                } arrow interactive placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Show volume indicators in space
                        </label>
                        <div className="dropdown">
                            <select value={props.showVolumeIndicators.toString()}
                                    onChange={({target: {value}}) => {
                                        if (value === "true")
                                            props.setShowVolumeIndicators(true)
                                        else
                                            props.setShowVolumeIndicators(false)

                                    }} name="volumeindicators">
                                <option value={"true"}>
                                    Show
                                </option>
                                <option value={"false"}>
                                    Disable
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
                <TurnOffCamera />
                <Tooltip title={
                    <div>
                        To not get distracted from your conversations you can disable the video in your own avatar.
                    </div>
                } arrow interactive placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Show video in your avatar
                        </label>
                        <div className="dropdown">
                            <select value={props.videoInAvatar.toString()}
                                    onChange={({target: {value}}) => {
                                        if (value === "true")
                                            props.setVideoInAvatar(true)
                                        else
                                            props.setVideoInAvatar(false)

                                    }}
                                    name="video_avatar">
                                <option value={"true"}>
                                    Show
                                </option>
                                <option value={"false"}>
                                    Disable
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
                <div className={"settings-item"}>
                    <label>
                        Background image
                    </label>
                    <button className={"submit outlined"}
                            onClick={() => alert("This feature is not available yet")}>
                        Select
                    </button>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    emailNotifications: false,
    videoInAvatar: state.playground.videoInAvatar,
    showVolumeIndicators: state.playground.showVolumeIndicators
})

const mapDispatchToProps = (dispatch: any) => ({
    setShowVolumeIndicators: (s: boolean) => dispatch(setShowVolumeIndicators(s)),
    setVideoInAvatar: (s: boolean) => dispatch(setVideoInAvatar(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings)