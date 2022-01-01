import React from "react";
import {IoArrowForward, IoHelpOutline} from "react-icons/all";
import {Tooltip} from "@material-ui/core";
import {applicationName, SUPPORT_URL} from "../../store/config";

export function GeneralSettings() {
    return (
        <div className={"mediaSettings"}>
            <div className={"toggles"}>
                <Tooltip title={
                    "Volume Indicators are a great way to show who is speaking. " +
                    "To save computing power you can disable them."
                } arrow interactive placement={"top"}>
                    <div className={"settings-item"}>
                        <label>
                            Show volume indicators in space
                            <IoHelpOutline/>
                        </label>
                        <div className="dropdown">
                            <select value={""}
                                //onChange={({target: {value}}) => this.props.changeVideoInput(value)}
                                    name="volumeindicators">
                                <option value={"true"}>
                                    Yes
                                </option>
                                <option value={"false"}>
                                    No
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
                            <select value={""}
                                //onChange={({target: {value}}) => this.props.changeVideoInput(value)}
                                    name="cameramode">
                                <option value={"false"}>
                                    Manual
                                </option>
                                <option value={"true"}>
                                    Automatically – when leaving the window in the background
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