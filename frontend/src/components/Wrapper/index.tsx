import React, {Component} from "react";
import './style.scss';
import {IoWifi} from "react-icons/all";
import {CircularProgress} from "@material-ui/core";
import {EasterEgg} from "../easteregg";

interface Props {
    className: string
}

export class Wrapper extends Component<Props> {

    render() {
        return (
            <div className={"contentWrapper"}>
                <div className={"backgroundRange"}/>
                <div className={"backgroundBall"}/>
                <div className={"contentBox " + this.props.className}>
                    {this.props.children}
                </div>
                <EasterEgg expiry={"December 23, 2021 23:59:00"} />
            </div>
        )
    }

}

interface LoadingProps {
    icon?: any,
    loadingText?: string
}

export class Loading extends Component<LoadingProps> {

    render() {
        return (
            <Wrapper className={"Loading"}>
                <div className={"headlineBox"}>
                    <h1>{this.props.icon ? this.props.icon : <IoWifi/>}</h1>
                    <h1>{this.props.loadingText ? this.props.loadingText : "Loading..."}</h1>
                    <CircularProgress color={"inherit"}/>
                </div>
            </Wrapper>
        )
    }

}

export default Wrapper
