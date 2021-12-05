import React from "react";
import "./style.scss"
import Fade from "react-reveal/Fade";
import {IoMdClose} from "react-icons/io";
import {Terms} from "./Terms";
import {Privacy} from "./Privacy";

interface Props {
    visible: boolean;
    onClick: () => void;
    page: string;
}

export function Imprint(props: Props) {

    const page = props.page;

    return (
        <div className="imprintComponent" id="imprint" onClick={props.onClick}>
            <Fade collapse when={props.visible}>
                <div className="overlay">
                    <Fade bottom collapse when={props.visible}>
                        <div className="imprintWrapper">
                            <div className="closeButton"><IoMdClose/></div>
                            <div className="contentWrapper">
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
