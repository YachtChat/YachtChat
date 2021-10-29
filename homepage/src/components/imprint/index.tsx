import React from "react";
import "./style.scss"
import Fade from "react-reveal/Fade";
import {IoMdClose} from "react-icons/io";

interface Props {
    visible: boolean;
    onClick: () => void;
}

export default class Imprint extends React.Component<Props> {
    render(): React.ReactElement | undefined {
        return (
            <div className="imprintComponent" id="imprint" onClick={this.props.onClick}>
                <Fade collapse when={this.props.visible}>
                    <div className="overlay">
                        <Fade bottom collapse when={this.props.visible}>
                            <div className="imprintWrapper">
                                <div className="closeButton"><IoMdClose/></div>
                                <div className="contentWrapper">
                                    Imprint
                                </div>
                            </div>
                        </Fade>
                    </div>
                </Fade>
            </div>);
    }
}