import React from "react";
import {IoArrowForward} from "react-icons/io5";
import {Tooltip} from "@mui/material";
import {applicationName, SUPPORT_URL} from "../../store/utils/config";
import {CameraMode} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import {setupCameraMode} from "../../store/playgroundSlice";
import posthog from "posthog-js";

interface Props {
    cameraMode: CameraMode,

    setupCameraMode: (mode: CameraMode) => void
}

export function TurnOffCamera(props: Props) {
    return (
        <Tooltip title={
            <div>
                <h2>What is this for?</h2>
                Sometimes using {applicationName} in the background can lead to interference with other video
                conferencing tools – especially on Microsoft Windows.

                <h2>Solution</h2>
                To avoid this we recommend installing virtual camera software. <br/>
                Alternatively, you can also let us automatically disable your camera
                when {applicationName} enters the background.
                <br/>
                <br/>
                To learn more about this topic click below:
                <br/>
                <br/>
                <a className={"button"} href={SUPPORT_URL + "/docs/Troubleshooting/background_video"}>Learn more <IoArrowForward/></a>
                <br/>
            </div>
        } arrow placement={"top"}>

            <div className={"settings-item"}>
                <label>
                    Turn off camera automatically
                </label>
                <div className="dropdown">
                    <select value={props.cameraMode}
                            // onChange={({target: {value}}) => {
                            //     switch (value) {
                            //         case CameraMode.Manual.toString():
                            //             props.setupCameraMode(CameraMode.Manual)
                            //             break
                            //         case CameraMode.Automatically.toString():
                            //             props.setupCameraMode(CameraMode.Automatically)
                            //             break;
                            //     }
                            //
                            // }}
                            onClick={e => {
                                posthog.capture("camera-automation", {value: e.target})
                                alert("This feature is not available yet. Let us know if you really need it.")
                            }}
                            name="cameramode">
                        <option value={CameraMode.Manual}>
                            Disable
                        </option>
                        <option disabled={true} value={CameraMode.Automatically}>
                            Enable
                        </option>
                    </select>
                </div>
            </div>
        </Tooltip>
    )
}

const mapStateToProps = (state: RootState) => ({
    cameraMode: state.playground.cameraMode,
})

const mapDispatchToProps = (dispatch: any) => ({
    setupCameraMode: (mode: CameraMode) => dispatch(setupCameraMode(mode)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TurnOffCamera)