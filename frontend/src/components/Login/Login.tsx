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
                           onChange={this.handleChange.bind(this)}/>
                            <label>Username</label>
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