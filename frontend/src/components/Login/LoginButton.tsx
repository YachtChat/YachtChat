import React, {Component} from "react";

interface Props {
    type: string
    onClick: () => void
}

export class LoginButton extends Component<Props> {

    render() {
        let image = ""
        let link = ""
        let color = ""
        switch (this.props.type) {
            case "google":
                image = ""
                link = ""
                color = "black"
                break;
            case "github":
                image = ""
                link = ""
                color = "black"
                break;
            case "apple":
                image = ""
                link = ""
                color = "black"
                break;
        }

        const style = {
            border: `solid 1px ${color}`,
        }

        const imageStyle = {
            background: `url(${image}) cover`
        }

        return (
            <div className="loginButton" onClick={this.props.onClick}>
                <div style={imageStyle} className="image"/>
                <div>Sign in with {this.props.type}</div>
            </div>
        )
    }

}

export default LoginButton;
