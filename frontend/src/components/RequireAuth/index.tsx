import React, {Component} from "react";
import {connect} from "react-redux";
import {RootState} from "../../store/utils/store";
import {IoCogOutline} from "react-icons/io5";
import {Loading} from "../Wrapper";

interface Props {
    authed: boolean,
    authFlowReady: boolean,
}

interface Children {
    children?: React.ReactNode
}

class RequireAuth extends Component<Props & Children> {
    render() {
        let {authed, authFlowReady} = this.props;
        if (authFlowReady && authed) {
            return this.props.children
        } else {
            return (
                <Loading loadingText="Authenticating" icon={<IoCogOutline/>}/>
            )
        }
    }
}

const mapStateToProps = (state: RootState) => ({
    authed: state.auth.loggedIn,
    authFlowReady: state.auth.authFlow
})

export default connect(mapStateToProps)(RequireAuth);
