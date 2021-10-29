import React, {useState} from "react";
import "./style.scss"
import Fade from "react-reveal/Fade";
import {IoMdClose} from "react-icons/io";
import {Terms} from "./Terms";
import {Privacy} from "./Privacy";

interface Props {
    visible: boolean;
    onClick: () => void;
}

export function Imprint(props: Props) {

    const [page, setPage] = useState("terms")

    return (
        <div className="imprintComponent" id="imprint" onClick={props.onClick}>
            <Fade collapse when={props.visible}>
                <div className="overlay">
                    <Fade bottom collapse when={props.visible}>
                        <div className="imprintWrapper">
                            <div className="closeButton"><IoMdClose/></div>
                            <div className="contentWrapper">
                                <button onClick={e => {
                                    e.stopPropagation()
                                    setPage("terms")
                                }}>Terms & Conditions
                                </button>
                                <button onClick={e => {
                                    e.stopPropagation()
                                    setPage("privacy")
                                }}>Privacy Policy
                                </button>
                                {(page === "terms") &&
                                <Terms/>
                                }
                                {(page === "privacy") &&
                                <Privacy/>
                                }
                            </div>
                        </div>
                    </Fade>
                </div>
            </Fade>
        </div>);
}
