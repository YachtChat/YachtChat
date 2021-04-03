import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/store";
import Login from "./components/Login";
import {connect, ConnectedComponent} from "react-redux";
import StatusComponent from "./components/Status";
import "webrtc-adapter";
import Spaces from './components/Spaces';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';

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
        this.state = {
            isUserAuthenticated: false
        };
    }

    render() {
        return (
            <Router>
                <div className={"App"}>
                    {/*{!this.props.joinedRoom && !this.props.loggedIn &&*/}
                    {/*<Login/>*/}
                    {/*}*/}
                    <Switch>
                        <PrivateRoute authed={(this.props.joinedRoom && this.props.connected)} path='/spaces/:spaceID'
                                      exact={false} component={Playground}/>
                        <PrivateRoute authed={!this.props.joinedRoom && !this.props.loggedIn} exact path='/spaces'>
                            <Spaces/>
                        </PrivateRoute>
                        <Route path='/login'>
                            {this.props.loggedIn ?
                                <Redirect to={"/spaces"}/> :
                                undefined
                            }
                            <Login/>
                        </Route>
                        <Route path='/'>
                            {this.props.loggedIn ?
                                <Redirect to={"/spaces"}/> :
                                <Redirect to={"/login"}/>
                            }
                        </Route>
                    </Switch>
                    <StatusComponent/>
                </div>
            </Router>
        );
    }

}

class PrivateRoute extends Component<{ authed: boolean, path: string, exact: boolean, render?: any, component?: ConnectedComponent<any, any> }> {
    render() {
        let {authed, ...rest} = this.props;
        return (
            <Route
                {...rest}
                render={(props) => authed
                    ? <Component {...props} />
                    : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>}
            />
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.auth.loggedIn,
    joinedRoom: state.webSocket.joinedRoom,
    connected: state.webSocket.connected
})


export default connect(mapStateToProps)(App);
