import "./style.scss"
import Fade from "react-reveal/Fade";
import {applicationName} from "../../util/config";
import {JoinButton} from "../joinButton";
import YachtChat from "../../rsc/mock_light.png";
import YachtChatDark from "../../rsc/mock_dark.png";
import {useState} from "react";
import {IoArrowDown, IoColorWandOutline, IoPeopleOutline, IoWalkOutline} from "react-icons/io5";
import {Separator} from "../separator";
import {Partner} from "./Partner";

export function About() {
    const [scrolled, setScrolled] = useState(false);
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            setScrolled(true);
        }
    })

    return (
        <div id={"about"} className={((!scrolled) ? "scrolled" : "")}>
            <IoArrowDown className={"scrollArrow"}/>
            <div className={'backgroundBall'}/>
            <Separator/>
            <div className={"contentWrapper"}>
                <div className={"content"}>
                    <div className={"image"}>
                        <img className={"light"} src={YachtChat} alt={"Yacht in action on a desk"}/>
                        <img className={"dark"} src={YachtChatDark} alt={"Yacht in action on a desk"}/>
                    </div>
                    <div className={"text"}>
                        <div className={"parallax"}>
                            <div className={"paragraphs"}>
                                <h1>
                                    {applicationName}
                                </h1>
                                <h2 className={"subtitle"}>
                                    A platform for you and your team
                                </h2>
                                {/*<p>*/}
                                {/*    But: {applicationName} is made for you and your social needs.{" "}*/}
                                {/*    With {applicationName} your going to be enabled to real-time collaborate with your*/}
                                {/*    remotely working team mates.{" "}*/}
                                {/*</p>*/}
                                <div className={"card"}>
                                    <IoWalkOutline className={'colleagues'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            Move around - colleagues close to you will hear you.
                                        </h2>

                                        <p>
                                            {applicationName} allows you to move around
                                            in an virtual office. Collaboration can emerge dynamically.
                                            Conversations will arise spontaneously in a way that fits your
                                            your team’s workflow.
                                        </p>
                                    </div>
                                </div>
                                <div className={"card"}>
                                    <IoPeopleOutline className={'colleagues'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            Work. Together.
                                        </h2>

                                        <p>
                                            Other tools can sometimes lead to a feeling of disconnection between you and your team. {" "}
                                            {applicationName} helps you to stay connected the whole working day - to collaborate, to ask a quick question, or from time to time
                                            just work together in silence.
                                        </p>
                                    </div>
                                </div>
                                {/* <div className={"card"}>
                                    <IoChatbubblesOutline className={'bubbles'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            Feel like a team again.{" "}
                                        </h2>
                                        <p>
                                            {applicationName} decreases the barrier between you and your colleages,
                                            helps to increase information exchange and lets you feel like a team
                                            again.{" "}
                                            {applicationName} combines the collaborative working methods of an office
                                            with
                                            the
                                            advantages of remote work and encourages you and your team to connect
                                            again.{" "}
                                        </p>
                                    </div>
                                </div> */}
                                <div className={"card"}>
                                    <IoColorWandOutline className={'bubbles'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            Easy to deploy. <br/>Free & open-source.{" "}
                                        </h2>
                                        <p>
                                            {applicationName} is easy to deploy. Follow the instructions on our GitHub and deploy it for free.{" "}
                                            Join the growing community around the leading tool for private and flexible communiction.{" "}
                                            If you need some support just get in touch with us.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Partner />
                <Fade bottom>

                    <div className={"youtubeWrapper"}>
                        <h1>
                            Watch the film
                        </h1>
                        <h2 className={"subtitle"}>
                            Learn about Yacht and see how it works.
                        </h2>
                        <div className={"youtube"}>
                            <iframe src="https://www.youtube-nocookie.com/embed/awFxmewPixU"
                                    title="YouTube video player" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen/>
                        </div>
                        <JoinButton className={"join"}/>
                    </div>
                </Fade>
            </div>
        </div>
    )
}