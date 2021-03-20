import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/playground";
import Login from "./components/Login/Login";
import {RootState} from "./store/store";
import {connect} from "react-redux";
import Landingpage from "./components/Landingpage/Landingpage";

interface Props {
    loggedIn: boolean
}

export class App extends Component<Props> {
    render() {
        return (
            <div className="App">
                {!this.props.loggedIn &&
                <Login/>
                }
                {this.props.loggedIn &&
                <Landingpage/>
                }
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.webSocket.loggedIn
})

export default connect(mapStateToProps)(App);
