import React, {Component} from "react";
import './style.scss';
import {IoWifi} from "react-icons/all";
import {CircularProgress} from "@material-ui/core";

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
            </div>
        )
    }

}

export class Loading extends Component {

    render() {
        return (
            <Wrapper className={"Loading"}>
                <div className={"headlineBox"}>
                    <h1><IoWifi/></h1>
                    <h1>Connecting...</h1>
                    <CircularProgress color={"inherit"}/>
                </div>
            </Wrapper>
        )
    }

}

export default Wrapper
