import "./style.scss"
import {Parallax} from "react-scroll-parallax";
import Fade from "react-reveal/Fade";
import {applicationName} from "../../util/config";
import {JoinButton} from "../joinButton";
import YachtChat from "../../rsc/Screenshot2.png";
import {useState} from "react";
import {IoArrowDown, IoChatbubblesOutline, IoPeopleOutline} from "react-icons/all";

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
            <svg className={"separator"} width="100%" height="100%" viewBox="0 0 1181 178" version="1.1"
                 style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
                <g transform="matrix(0.268213,0,0,0.268213,546.275,557.46)">
                    <circle cx="168" cy="2233" r="4256"/>
                </g>
            </svg>
            <div className={"contentWrapper"}>
                <div className={"content"}>
                    <Parallax className={"image"} y={[-20, 20]}>
                        <img src={YachtChat} alt={"Yacht in action on a desk"}/>
                    </Parallax>
                    <div className={"text"}>
                        <Parallax className={"parallax"} y={[-10, 10]}>
                            <div className={"paragraphs"}>
                                <h1>
                                    Presenting: {applicationName}
                                </h1>
                                <h2 className={"subtitle"}>
                                    The future of remote collaboration
                                </h2>
                                {/*<p>*/}
                                {/*    But: {applicationName} is made for you and your social needs.{" "}*/}
                                {/*    With {applicationName} your going to be enabled to real-time collaborate with your*/}
                                {/*    remotely working team mates.{" "}*/}
                                {/*</p>*/}
                                <div className={"card"}>
                                    <IoPeopleOutline className={'colleagues'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            A platform for you and your colleagues.
                                        </h2>

                                        <p>
                                            Unlike existing communication solutions, {applicationName} allows each team
                                            member
                                            to move around freely in a virtual space and adjust their speaking
                                            radius.{" "}
                                            Conversations can emerge spontaneously and adapt to team dynamics.{" "}
                                        </p>
                                    </div>
                                </div>
                                <div className={"card"}>
                                    <IoChatbubblesOutline className={'bubbles'}/>
                                    <div className={"paragraph"}>
                                        <h2 className={"title"}>
                                            Feel like a team again.{" "}
                                        </h2>
                                        <p>
                                            {applicationName} helps increase information exchange and lets you feel like
                                            a
                                            team again.{" "}
                                            {applicationName} combines the collaborative working methods of an office
                                            with
                                            the
                                            advantages of remote work and encourages you and your team to talk
                                            again.{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Parallax>
                    </div>
                </div>
                <Fade bottom>

                    <div className={"youtubeWrapper"}>
                        <h1>
                            Watch the film
                        </h1>
                        <h2 className={"subtitle"}>
                            Learn about Yacht and see how it works.
                        </h2>
                        <div className={"youtube"}>
                            <iframe src="https://www.youtube-nocookie.com/embed/CN1HuE_Yalo"
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