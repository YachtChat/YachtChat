import posthog from "posthog-js";
import React, {useState} from "react";
import {IoMdClose} from "react-icons/io";
import Fade from "react-reveal/Fade";
import "./style.scss";
import {IoArrowForward} from "react-icons/all";


interface Props {
    image?: HTMLImageElement
    visible: boolean;
    onClick: () => void;
}


export function EasterEgg(props: Props) {

    const [email, setEmail] = useState("");
    const [alert, setAlert] = useState(false);
    const buttonName = "Submit"

    return (
        <div className="popup" onClick={() => {
            props.onClick()
            setAlert(false)
        }}>
            <Fade collapse when={props.visible}>
                <div className="overlay">
                    <div className="wrapper">
                        <div className="closeButton"
                             onClick={() => {
                                 props.onClick()
                                 setAlert(false)
                             }}>
                            <IoMdClose/>
                        </div>
                        <div className="contentWrapper" onClick={(e) => e.stopPropagation()}>
                            {props.image}
                            <h1>You found it!</h1>
                            <p>
                                You found the easter egg! If you want to you can now take part in the competition.
                                At the end of the christmas countdown we will announce the winner on instagram and
                                linkedin and contact you personally.
                            </p>
                            <p>
                                If you want to take part in the competition,
                                please enter either your email,
                                instagram-tag or linkedin-page below.
                            </p>
                            <div>
                                <div>
                                    <input className={alert ? "alert" : ""}
                                           type="text"
                                           placeholder={"E-Mail, @Instagram or linkedin.com/in/"}
                                           value={email}
                                           onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button onClick={() => {
                                    if (email.length > 0) {
                                        posthog.capture("EasterEgg", {email});
                                        props.onClick()
                                        setAlert(false)
                                    } else {
                                        setAlert(true)
                                    }
                                }}>
                                    {buttonName} <IoArrowForward/>
                                </button>
                                <label className={"legal"}>
                                    By clicking "{buttonName}" you consent to our privacy policy as well as to use the
                                    data
                                    provided
                                    for the purposes of contacting you.
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        </div>
    )
}