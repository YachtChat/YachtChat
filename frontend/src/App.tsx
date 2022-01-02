import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/store";
import {connect} from "react-redux";
import StatusComponent from "./components/Status";
import "webrtc-adapter";
import Spaces from './components/Spaces';
import {Redirect, Route, Switch} from 'react-router-dom';
import {checkAuth} from "./store/authSlice";
import PrivateRoute from "./components/PrivateRoute";
import Settings from './components/Settings';
import {Loading} from "./components/Wrapper";
import {IoCogOutline} from "react-icons/all";
import CreateSpace from "./components/Spaces/CreateSpace";
import InviteSpace from "./components/Spaces/InviteSpace";
import JoinSpace from "./components/Spaces/JoinSpace";
import mobile from "is-mobile";
import posthog from 'posthog-js';

interface Props {
    loggedIn: boolean
    authFlowReady: boolean
    joinedRoom: boolean
    connected: boolean
    checkAuth: (token?: string) => void
}

interface State {
}

export class App extends Component<Props, State> {

    componentDidMount() {
        const search = window.location.search
        const id_token = new URLSearchParams(search).get('id_token')
        this.props.checkAuth((id_token) ? id_token : undefined)

        if (mobile())
            window.alert("This website is not optimized for mobile devices.")
    }

    render() {
        if (!window.location.href.includes('localhost')) {
            posthog.init("phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC", {api_host: 'https://posthog.yacht.chat'});
        }
        // for local development with posthog
        // posthog.init("", {api_host: 'http://localhost:8000'});

        return (
            <div className={"App"}>
                {/*{!this.props.joinedRoom && !this.props.loggedIn &&*/}
                {/*<Login/>*/}
                {/*}*/}
                <Switch>
                    <PrivateRoute path='/spaces/:spaceID' component={Playground}/>
                    <PrivateRoute path='/spaces/:spaceID/:token' component={Playground}/>
                    <PrivateRoute path='/invite/:spaceID' component={InviteSpace}/>
                    <PrivateRoute path='/join/:token' component={JoinSpace}/>
                    <PrivateRoute exact path='/spaces' component={Spaces}/>
                    <PrivateRoute path='/settings/:site' component={Settings}/>
                    <Route exact path='/settings/' children={<Redirect to={"/settings/general"}/>}/>
                    <PrivateRoute exact path='/create-space' component={CreateSpace}/>
                    <Route path='/'>
                        {(this.props.authFlowReady) ?
                            ((this.props.loggedIn) ?
                                <Redirect to={"/spaces"}/> :
                                <Loading loadingText="Loading" icon={<IoCogOutline/>}/>)
                            : <Loading loadingText="Authenticating" icon={<IoCogOutline/>}/>}
                    </Route>
                    <Route path="*">
                        <Redirect to={"/"}/>
                    </Route>
                </Switch>
                <StatusComponent/>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.auth.loggedIn,
    joinedRoom: state.webSocket.joinedRoom,
    connected: state.webSocket.connected,
    authFlowReady: state.auth.authFlow
})

const mapDispatchToProps = (dispatch: any) => ({
    checkAuth: (token?: string) => dispatch(checkAuth(token))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
