import React, {Component} from "react";
import {connect} from "react-redux";
import {joinSpace} from "../../store/spaceSlice";
import {Loading} from "../Wrapper";

interface Props {
    match?: {
        params: {
            token: string
        }
    }
    join: (token: string) => void
}


export class JoinSpace extends Component<Props> {

    componentDidMount() {
        this.props.join(this.props.match?.params.token!)
    }

    render() {
        return (
            <Loading/>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    join: (token: string) => dispatch(joinSpace(token))
})

export default connect(undefined, mapDispatchToProps)(JoinSpace)