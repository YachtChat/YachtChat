import {BiMouse, IoVolumeHigh} from "react-icons/all";
import React, {useEffect, useState} from "react";
import "./style.scss"
import {applicationName} from "../../util/config";
import {JoinButton} from "../joinButton";
import {Separator} from "../separator";
import {EasterEgg} from "../easteregg";
import christmasyacht from "../../rsc/christmasyacht.png";

export function Tutorial() {
    const [click, setClick] = useState(false);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const current = new Date();
        const expiry = new Date("December 14, 2021 15:00:00")

        if (current.getTime() < expiry.getTime()) {
            setShowEasterEgg(true)
            console.log(current.getTime(), expiry.getTime())
        } else {
            setShowEasterEgg(false)
        }
    }, []);

    return (
        <div id={"tutorial"}>
            <Separator/>
            <div className={"contentWrapper"}>
                <h1>How to</h1>
                <h2 className={"subtitle"}>How does {applicationName} work?</h2>
                <div className={"list"}>
                    <div className={"listItem"}>
                        <div className={"itemIcon code"}>
                            {">"}<span className={"animateicon"} id={"cursoricon"}>_</span>
                        </div>
                        <div className={"itemText"}>
                            <h3>1. Create a space and join</h3>
                            After logging in, create a space.
                            You will instantly receive an invitation link to let others join.
                            After joining you are a member and can always return.
                            A space can be associated with an office or room. <i>Your</i> very own.
                        </div>
                    </div>

                    <div className={"listItem"}>
                        <div className={"itemIcon"}>
                            <div className={"animateicon"} id={"mouseicon"}><BiMouse/></div>
                        </div>
                        <div className={"itemText"}>
                            <h3>2. Drag'n'Drop</h3>
                            After joining you will see the space in all its glory with the active members.
                            Click or drag yourself somewhere you want to go.
                            Easily mute yourself, get an overview over all members or share your screen with the control
                            bar on the left.
                        </div>
                    </div>

                    <div className={"listItem"}>
                        <div className={"itemIcon code"}>
                            <div className={"animateicon"} id={"volumeicon"}><IoVolumeHigh/></div>
                        </div>
                        <div className={"itemText"}>
                            <h3>3. Speak and Listen</h3>
                            Other members can only hear you when they are in your range - the blue area around you.
                            You can quickly change the size of your range on the control bar.
                        </div>
                    </div>
                </div>
                <JoinButton className={"join"}/>

                {showEasterEgg &&
                    <div>
                        <EasterEgg visible={click} onClick={() => setClick(false)}/>
                        <img className={"christmasyacht"} src={christmasyacht} alt={"The christmas yacht.chat"}
                             onClick={() => setClick(true)}/>
                    </div>
                }
            </div>
        </div>
    )

}