import {BiMouse, IoVolumeHigh} from "react-icons/all";
import React from "react";
import "./style.scss"
import {applicationName} from "../../util/config";

export function Tutorial() {
    return (
        <div id={"tutorial"}>
            <div className={"backgroundBall"}/>
            <svg className={"separator"} width="100%" height="100%" viewBox="0 0 1181 178" version="1.1"
                 style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
                <g transform="matrix(0.268213,0,0,0.268213,546.275,557.46)">
                    <circle cx="168" cy="2233" r="4256"/>
                </g>
            </svg>
            <div className={"contentWrapper"}>
                <h1>How to</h1>
                <h2 className={"subtitle"}>How does {applicationName} work?</h2>
                <div className={"list"}>

                    <div className={"listItem"}>
                        <div className={"itemIcon code"}>
                            {">"}<span className={"animateicon"} id={"cursoricon"}>_</span>
                        </div>
                        <div className={"itemText"}>
                            After logging in, create a space.
                            You will instantly receive an invitation link to let others join.
                            After joining you are a member and since you are now a member you can always return.
                            A space can be associated with an office or room. <i>Your</i> very own.
                        </div>
                    </div>

                    <div className={"listItem"}>
                        <div className={"itemIcon"}>
                            <div className={"animateicon"} id={"mouseicon"}><BiMouse/></div>
                        </div>
                        <div className={"itemText"}>
                            After joining you will see the space in all its glory with all the active members..
                            Click or drag yourself somewhere you want to go.
                            Easily mute yourself, get an overview over all members or share the screen with the control
                            bar on the left.
                        </div>
                    </div>

                    <div className={"listItem"}>
                        <div className={"itemIcon code"}>
                            <div className={"animateicon"} id={"volumeicon"}><IoVolumeHigh/></div>
                        </div>
                        <div className={"itemText"}>
                            Other members can only hear you when they are in your range - the blue halo around you.
                            You can quickly change the size of your range on the control bar.
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )

}