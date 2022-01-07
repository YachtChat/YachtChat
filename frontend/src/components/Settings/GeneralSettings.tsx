import React from "react";
import {IoArrowForward} from "react-icons/all";
import {Tooltip} from "@material-ui/core";
import {applicationName, SUPPORT_URL} from "../../store/config";
import {CameraMode} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {setShowVolumeIndicators, setupCameraMode, setVideoInAvatar} from "../../store/playgroundSlice";

interface Props {
    emailNotifications: boolean
    videoInAvatar: boolean,
    cameraMode: CameraMode,
    showVolumeIndicators: boolean

    setupCameraMode: (mode: CameraMode) => void
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
                <Tooltip title={
                    <div>
                        <h2>Problem</h2>
                        Sometimes using {applicationName} in the background can lead to interference with other video
                        chatting services – especially on Microsoft Windows.

                        <h2>Solution</h2>
                        To avoid this we recommend to install a virtual camera software. <br/>
                        Alternatively, you could also automatically disable your camera as a workaround ,
                        when {applicationName} enters the background.
                        <br/>
                        <br/>
                        To learn more about this topic click below:
                        <br/>
                        <br/>
                        <a className={"button"} href={SUPPORT_URL}>Learn more <IoArrowForward/></a>
                        <br/>
                    </div>
                } arrow interactive placement={"top"}>

                    <div className={"settings-item"}>
                        <label>
                            Turn off camera
                        </label>
                        <div className="dropdown">
                            <select value={props.cameraMode}
                                    onChange={({target: {value}}) => {
                                        switch (value) {
                                            case CameraMode.Manual.toString():
                                                props.setupCameraMode(CameraMode.Manual)
                                                break
                                            case CameraMode.Automatically.toString():
                                                props.setupCameraMode(CameraMode.Automatically)
                                                break;
                                        }

                                    }} name="cameramode">
                                <option value={CameraMode.Manual}>
                                    Manual
                                </option>
                                <option value={CameraMode.Automatically}>
                                    Automatically – when leaving the window in the background
                                </option>
                            </select>
                        </div>
                    </div>
                </Tooltip>
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
    cameraMode: state.playground.cameraMode,
    showVolumeIndicators: state.playground.showVolumeIndicators
})

const mapDispatchToProps = (dispatch: any) => ({
    setupCameraMode: (mode: CameraMode) => dispatch(setupCameraMode(mode)),
    setShowVolumeIndicators: (s: boolean) => dispatch(setShowVolumeIndicators(s)),
    setVideoInAvatar: (s: boolean) => dispatch(setVideoInAvatar(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings)