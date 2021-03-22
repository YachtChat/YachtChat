import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {connectToServer, requestLogin} from "../../store/connectionSlice";

interface Props {
    activeUser: User
    setName: (name: string) => void
    connect: () => void
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
    }

    render() {
        return (

            <div className="login-box">
                <h2>Alphabibber Master App. Please sign in</h2>

                <form>
                    <div className="user-box">
                        <input type="text" value={this.state.value}
                               onKeyDown={this.handleKeySubmit.bind(this)}
                               onChange={this.handleChange.bind(this)} autoFocus/>
                            <label>Username</label>
                    </div>
                    <div className="user-box">
                        <input type="password"/>
                        <label>Password</label>
                    </div>
                    <button onClick={this.handleSubmit.bind(this)}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Submit
                    </button>
                </form>


            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(requestLogin(name)),
    connect: () => dispatch(connectToServer())
})

export default connect(mapStateToProps,  mapDispatchToProps)(Login)