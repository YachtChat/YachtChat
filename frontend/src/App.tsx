import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/store";
import Login from "./components/Login";
import {connect} from "react-redux";
import StatusComponent from "./components/Status";
import "webrtc-adapter";
import Spaces from './components/Spaces';

interface Props {
    loggedIn: boolean
    joinedRoom: boolean
    connected: boolean
}

interface State {
}

export class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state ={
            isUserAuthenticated: false
        };
    }

    render() {
        return (
            <div className={"App"}>
                {(this.props.joinedRoom && this.props.connected) &&
                <Playground/>
                }
                {!this.props.joinedRoom && this.props.loggedIn &&
                <Spaces/>
                }
                {!this.props.joinedRoom && !this.props.loggedIn &&
                <Login/>
                }
                <StatusComponent/>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.auth.loggedIn,
    joinedRoom: state.webSocket.joinedRoom,
    connected: state.webSocket.connected
})


export default connect(mapStateToProps)(App);
