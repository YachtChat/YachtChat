import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/store";
import Login from "./components/Login/Login";
import {connect} from "react-redux";
import StatusComponent from "./components/Status/StatusComponent";

interface Props {
    loggedIn: boolean
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
                {this.props.loggedIn &&
                <Playground/>
                }
                {!this.props.loggedIn &&
                <Login/>
                }
                <StatusComponent/>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.webSocket.loggedIn
})


export default connect(mapStateToProps)(App);
