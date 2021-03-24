import React, {Component} from "react";
import './style.scss';
import {Space, User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {connectToServer, requestLogin} from "../../store/connectionSlice";
import {requestSpaces} from "../../store/spaceSlice";
import googleButton from "../../rsc/google_button.svg";
import appleLogo from "../../rsc/apple.svg";
import github from "../../rsc/github.svg";
import {loginService} from "../../store/config";

interface Props {
    activeUser: User
    spaces: Space[]
    setName: (name: string) => void
    connect: () => void
    requestSpaces: () => void
}

interface State {
    value: string
}

export class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            value: ""
        }
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event: any) {
        this.props.setName(this.state.value)
        event.preventDefault();

    }

    handleKeySubmit(event: React.KeyboardEvent) {
        if (event.key === "13") {
            this.props.setName(this.state.value)
        }
    }

    componentDidMount() {
        this.props.connect()
        this.props.requestSpaces()
    }

    render() {
        return (
            <div className={"contentWrapper"}>
                <div className={"backgroundRange"}/>
                <div className={"backgroundBall"}/>
                <div className="login-box">

                    <div className={"signin"}>
                        <h2>AlphaBibber Chat</h2>
                        <h3>Sign in</h3>
                        <div className="login-buttons">

                            <div style={{background: "black"}} className={"logoImage"}>
                                <a href={loginService.concat("/oauth_login/?method=apple")}>
                                    <img alt={"Sign in with Apple"} src={appleLogo}/>
                                </a>
                            </div>

                            <div style={{background: "white"}} className={"logoImage"}>
                                <a href={loginService.concat("/oauth_login/?method=google")}>
                                    <img alt={"Sign in with Google"} src={googleButton}/>
                                </a>
                            </div>

                            <div id={"github"} className={"logoImage"}>
                                <a href={loginService.concat("/oauth_login/?method=github")}>
                                    <img src={github}/>
                                </a>
                            </div>
                        </div>
                        </div>

                    <form>
                        <div className="user-box">
                            <h3>Or join public space</h3>
                            <label>Username</label>
                            <div className="inputPair">
                                <input type="text" value={this.state.value}
                                       onKeyDown={this.handleKeySubmit.bind(this)}
                                       onChange={this.handleChange.bind(this)} autoFocus/>
                            </div>

                            <button onClick={this.handleSubmit.bind(this)}>
                                Join
                            </button>
                        </div>
                    </form>


                </div>
            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaces: state.space.spaces
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(requestLogin(name)),
    requestSpaces: () => dispatch(requestSpaces()),
    connect: () => dispatch(connectToServer())
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
