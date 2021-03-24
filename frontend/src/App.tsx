import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/store";
import Login from "./components/Login/Login";
import {connect} from "react-redux";
import StatusComponent from "./components/Status/StatusComponent";
import "webrtc-adapter";

interface Props {
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
                {!this.props.joinedRoom &&
                <Login/>
                }
                <StatusComponent/>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    joinedRoom: state.webSocket.joinedRoom,
    connected: state.webSocket.connected
})


export default connect(mapStateToProps)(App);
