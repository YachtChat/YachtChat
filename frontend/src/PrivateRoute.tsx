import React, {Component} from "react";
import {connect, ConnectedComponent} from "react-redux";
import {Redirect, Route} from "react-router-dom";
import {RootState} from "./store/store";

interface Props {
    authed: boolean,
    authFlowReady: boolean,
    path: string,
    exact: boolean,
    render?: any,
    component: ConnectedComponent<any, any>
}

class PrivateRoute extends Component<Props> {
    render() {
        let {authed, authFlowReady, component: Component, ...rest} = this.props;
        return (
            <Route
                {...rest}
                render={(props) => (authFlowReady) ?
                    (authed) ?
                        <Component {...props} />
                        : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
                    : <div/>
                }
            />
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    authed: state.auth.loggedIn,
    authFlowReady: state.auth.authFlow
})

export default connect(mapStateToProps)(PrivateRoute);
