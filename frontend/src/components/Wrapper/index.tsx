import React, {Component} from "react";
import './style.scss';
import {IoChevronBack, IoWifi} from "react-icons/all";
import {CircularProgress} from "@material-ui/core";
import Navigation from "../Navigation";
import {Route, Link} from "react-router-dom";

interface Props {
    className?: string
    id?: string
}

export class Wrapper extends Component<Props> {

    render() {
        return (
            <div className={"contentWrapper"}>
                <div className={"backgroundRange"}/>
                <div className={"backgroundBall"}/>
                <div id={this.props.id} className={"contentBox " + this.props.className}>
                    {this.props.children}
                </div>
                <Route path={"/:site/"} children={<Navigation />}/>
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
                    <Link to={"/"}>
                        <button>
                            <IoChevronBack /> back to spaces
                        </button>
                    </Link>
                    <h1>{this.props.icon ? this.props.icon : <IoWifi/>}</h1>
                    <h1>{this.props.loadingText ? this.props.loadingText : "Loading..."}</h1>
                    <CircularProgress color={"inherit"}/>
                </div>
            </Wrapper>
        )
    }

}

export default Wrapper
