import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {submitNameChange} from "../../store/userSlice";
import {connect} from "react-redux";
import {RootState} from "../../store/store";

interface Props {
    activeUser: User
    setName: (name: string) => void
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
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return(

            <div id="loginPage">
                <h1>Alphabibber Master App. Please sign in</h1>

                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label>Your Name: </label>
                    <input type="text" id="usernameInput" placeholder="Name" value={this.state.value} onChange={this.handleChange.bind(this)} />
                    <input type="submit" value="Submit" id="submitBtn" />
                </form>


            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(submitNameChange(name)),
})

export default connect(mapStateToProps,  mapDispatchToProps)(Login)