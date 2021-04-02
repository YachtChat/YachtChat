import React, {Component} from "react";
import './style.scss';

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

export default Wrapper
