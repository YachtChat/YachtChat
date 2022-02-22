import React from "react";
import {Tooltip} from "@mui/material";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import {setNotifications, setShowVolumeIndicators, setVideoInAvatar} from "../../store/playgroundSlice";
import TurnOffCamera from "./TurnOffCamera";
import {requestNotifications} from "../../store/utils/notifications";
import {handleSuccess} from "../../store/statusSlice";
import posthog from "posthog-js";

interface Props {
    emailNotifications: boolean
    videoInAvatar: boolean,
    showVolumeIndicators: boolean
    notifications: boolean

    setShowVolumeIndicators: (s: boolean) => void
    setVideoInAvatar: (s: boolean) => void
    enableNotifications: () => void
    disableNotifications: () => void
    success: (s: string) => void
}

export function GeneralSettings(props: Props) {
    return (
        <div className={"mediaSettings"}>
            <div className={"toggles"}>
                <Tooltip title={
                    "If this feature is enabled, all Space-Members will get notified by mail when the first user joins a " +
                    "Space."
                } arrow placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Send email notification when first user joins space
                        </label>
                        <div className="dropdown" onClick={() => {
                            posthog.capture("email-notifications-feature")
                            alert("This feature is not available yet. Let us know if you really need it.")
                        }}>
                            <select
                                // onChange={({target: {value}}) => this.props.changeVideoInput(value)}
                                name="volumeindicators">
                                <option value={"false"}>
                                    Disable
                                </option>
                                <option disabled={true} value={"true"}>
                                    Enable
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
                <Tooltip title={
                   "If this feature is enabled, there will be visual feedback when you or another user speaks."
                } arrow placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Show volume indicators in space
                        </label>
                        <div className="dropdown" onClick={() => {
                            posthog.capture("volume-indicators-feature")
                            alert("This feature is not available yet. Let us know if you really need it.")
                        }}>
                            <select value={props.showVolumeIndicators.toString()}
                            //          onChange={({target: {value}}) => {
                            //     if (value === "true") {
                            //         props.setShowVolumeIndicators(true)
                            //         props.success("Enabled volume indicators")
                            //     } else {
                            //         props.setShowVolumeIndicators(false)
                            //         props.success("Disabled volume indicators")
                            //     }
                            // }}
                                    name="volumeindicators">
                                <option value={"false"}>
                                    Disable
                                </option>
                                <option disabled={true} value={"true"}>
                                    Enable
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
                <TurnOffCamera/>
                <Tooltip title={
                    <div>
                        To not get distracted from your conversations you can disable the video in your own avatar.
                    </div>
                } arrow placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Do not show own video
                        </label>
                        <div className="dropdown" onClick={() => {
                            posthog.capture("own-video-feature")
                            alert("This feature is not available yet. Let us know if you really need it.")
                        }}>
                            <select value={props.videoInAvatar.toString()}
                                    // onChange={({target: {value}}) => {
                                    //     if (value === "true") {
                                    //         props.setVideoInAvatar(true)
                                    //         props.success("Enabled video in avatar")
                                    //     } else {
                                    //         props.setVideoInAvatar(false)
                                    //         props.success("Disabled the video in avatar")
                                    //     }
                                    // }}
                                    name="video_avatar">
                                <option value={"true"}>
                                    Disable
                                </option>
                                <option disabled={true} value={"false"}>
                                    Enable
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
                            onClick={() => {
                                posthog.capture("setBackgroundImage")
                                window.alert("This feature is not available yet. Let us know if you really need it.")
                            }}>
                        Select
                    </button>
                </div>
                <div className={"settings-item"}>
                    <label>
                        Notifications
                    </label>
                    {"Notification" in window &&
                        <Tooltip
                            title={"Get notified when a colleague moves close to you and Yacht.Chat is currently in the " +
                                "background."}
                            arrow placement={"top"}>
                            <div>

                                {(!props.notifications || Notification.permission === 'denied' || Notification.permission === 'default') &&
                                    <button className={"submit outlined"}
                                            onClick={() => {
                                                props.enableNotifications()
                                            }}>
                                        Enable
                                    </button>
                                }
                                {(Notification.permission === 'granted' && props.notifications) &&
                                    <button className={"submit outlined"}
                                            onClick={() => {
                                                props.success("Notifications disabled")
                                                props.disableNotifications()
                                            }}>
                                        Disable
                                    </button>
                                }
                            </div>
                        </Tooltip>
                    }
                    {!("Notification" in window) &&
                        <input disabled value={"Not available in your browser"}/>
                    }
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    emailNotifications: false,
    videoInAvatar: state.playground.videoInAvatar,
    showVolumeIndicators: state.playground.showVolumeIndicators,
    notifications: state.playground.notifications
})

const mapDispatchToProps = (dispatch: any) => ({
    setShowVolumeIndicators: (s: boolean) => dispatch(setShowVolumeIndicators(s)),
    setVideoInAvatar: (s: boolean) => dispatch(setVideoInAvatar(s)),
    enableNotifications: () => dispatch(requestNotifications()),
    success: (s: string) => dispatch(handleSuccess(s)),
    disableNotifications: () => {
        handleSuccess("Disabled notifications")
        dispatch(setNotifications(false))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings)