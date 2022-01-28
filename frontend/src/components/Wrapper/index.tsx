import React, {Component} from "react";
import './style.scss';
import {IoChevronBack, IoWifi} from "react-icons/io5";
import {CircularProgress, Fade} from "@mui/material";
import Navigation from "../Navigation";
import {Link} from "react-router-dom";

interface Props {
    className?: string
    id?: string
}

export class Wrapper extends Component<Props> {


    render() {
        const transitionKey = !window.location.href.includes("settings") ? window.location.href : "settings"
        return (
            <div className={"contentWrapper"}>
                <div className={"backgroundRange"}/>
                <div className={"backgroundBall"}/>
                <div id={this.props.id} className={"contentBox " + this.props.className}>
                    <Fade in={true} key={transitionKey}>
                        <div>
                            {this.props.children}
                        </div>
                    </Fade>
                </div>
                <Navigation/>
            </div>
        )
    }

}

interface LoadingProps {
    icon?: any,
    loadingText?: string
}

export function Loading(props: LoadingProps) {
        return (
            <Wrapper className={"Loading"}>
                <div className={"headlineBox"}>
                    <Link to={"/"}>
                        <button className={"outlined"}>
                            <IoChevronBack/> back to spaces
                        </button>
                    </Link>
                    <h1>{props.icon ? props.icon : <IoWifi/>}</h1>
                    <h1>{props.loadingText ?? "Connecting..."}</h1>
                    <CircularProgress color={"inherit"}/>
                </div>
            </Wrapper>
        )
}

export default Wrapper
