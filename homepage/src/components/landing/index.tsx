import React from "react";
import "./style.scss"
import YachtScreenshot from "../../rsc/demo_thumb_light.png"
import YachtScreenshotDark from "../../rsc/demo_thumb_dark.png"
import {JoinButton} from "../joinButton";
import {Links} from "../joinButton/links";
import Yacht from "../../rsc/demo_light2.mp4"
import YachtDark from "../../rsc/demo_dark2.mp4"
import {Parallax} from "react-scroll-parallax";
import {Separator} from "../separator";

export function Landing() {
    return (
        <div id={"landing"}>
            <div id={"intro"}>
                <div className={"contentWrapper"}>
                    <Separator/>

                    <div className={"backgroundWrapper"}>
                        <div className={"background"}/>
                    </div>
                    <Parallax className={"screenshot"} y={[-20, 20]}>
                        <video className={"demo light"} autoPlay loop muted>
                            <source src={Yacht} type={"video/mp4"}/>
                            <img className={"demo light"} src={YachtScreenshot} alt={"Yacht Screenshot"}/>
                        </video>
                        <video className={"demo dark"} autoPlay loop muted>
                            <source src={YachtDark} type={"video/mp4"}/>
                            <img className={"demo light"} src={YachtScreenshotDark} alt={"Yacht Screenshot"}/>
                        </video>
                    </Parallax>
                    <div className={"content"}>


                        <div className={"introText"}>
                            <div className={"headings"}>
                                <h1>Bring your team home.</h1>
                                <h2 className={"subheading"}>
                                    {/* Experience a new and private way of spontaneous remote */}
                                    {/* communication that follows your team’s workflow. */}
                                    The leading open-source solution for a private and personal communication that follows your workflow like in the office.
                                </h2>
                            </div>

                            <JoinButton/>

                            <br/>

                            <Links/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
