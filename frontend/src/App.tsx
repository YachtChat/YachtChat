import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import {RootState} from "./store/utils/store";
import {connect} from "react-redux";
import StatusComponent from "./components/Status";
import "webrtc-adapter";
import Spaces from './components/Spaces';
import {Navigate, Route, Routes} from 'react-router-dom';
import {checkAuth} from "./store/authSlice";
import Settings from './components/Settings';
import {Loading} from "./components/Wrapper";
import {IoCogOutline} from "react-icons/io5";
import CreateSpace from "./components/Spaces/CreateSpace";
import InviteSpace from "./components/Spaces/InviteSpace";
import JoinSpace from "./components/Spaces/JoinSpace";
import mobile from "is-mobile";
import posthog from 'posthog-js';
import RequireAuth from "./components/RequireAuth";
import {ParamsPass} from "./components/Wrapper/ParamsPass";

interface Props {
    loggedIn: boolean
    authFlowReady: boolean
    joinedSpace: boolean
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
                <Routes>
                    <Route path='/invite/:spaceID' element={
                        <RequireAuth>
                            <ParamsPass Component={InviteSpace}/>
                        </RequireAuth>
                    }/>
                    <Route path='/join/:token' element={
                        <RequireAuth>
                            <ParamsPass Component={JoinSpace}/>
                        </RequireAuth>
                    }/>
                    <Route path='spaces'>
                        <Route index element={
                            <RequireAuth>
                                <Spaces/>
                            </RequireAuth>
                        }/>
                        <Route path=':spaceID' element={
                            <RequireAuth>
                                <ParamsPass Component={Playground}/>
                            </RequireAuth>
                        }/>
                    </Route>
                    <Route path='settings'>
                        <Route index element={
                            <Navigate to={"general"}/>
                        }/>
                        <Route path={":site"} element={
                            <RequireAuth>
                                <Settings/>
                            </RequireAuth>
                        }/>
                    </Route>
                    <Route path='/create-space' element={
                        <RequireAuth>
                            <CreateSpace/>
                        </RequireAuth>
                    }/>
                    <Route path='/' element={
                        <>
                            {(this.props.authFlowReady) ?
                                ((this.props.loggedIn) ?
                                    <Navigate to={"/spaces"}/> :
                                    <Loading loadingText="Loading" icon={<IoCogOutline/>}/>)
                                : <Loading loadingText="Authenticating" icon={<IoCogOutline/>}/>}
                        </>
                    }/>
                    <Route path="*" element={
                        <Navigate to={"/"}/>
                    }/>
                </Routes>
                <StatusComponent/>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    loggedIn: state.auth.loggedIn,
    joinedSpace: !!state.space.joinedSpace,
    connected: state.webSocket.connected,
    authFlowReady: state.auth.authFlow
})

const mapDispatchToProps = (dispatch: any) => ({
    checkAuth: (token?: string) => dispatch(checkAuth(token))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
