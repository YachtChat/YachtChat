import {BiMouse, IoVolumeHigh} from "react-icons/all";
import React from "react";
import "./style.scss"

export function Tutorial() {
    return (
        <div id={"tutorial"}>
            {/*<div className={"backgroundBall"}/>*/}
            <div className={"contentWrapper"}>
                <h1>How to</h1>
                <h2 className={"subtitle"}>How does Yacht.Chat work?</h2>
                <div className={"list"}>

                    <div className={"listItem"}>
                        <div className={"itemIcon code"}>
                            N<span className={"animateicon"} id={"cursoricon"}>_</span>
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