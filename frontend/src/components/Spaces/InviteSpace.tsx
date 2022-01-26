import React, {Component} from "react";
import Wrapper from "../Wrapper";
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {IoArrowForward, IoCopyOutline} from "react-icons/io5";
import {connect} from "react-redux";
import {RootState} from "../../store/utils/store";
import {CircularProgress, Tooltip} from "@mui/material";
import {applicationName, FRONTEND_URL} from "../../store/utils/config";
import {Space} from "../../store/model/model";
import {Steps} from "./Steps";
import {copyInviteLink} from "../../store/utils/utils";
import {getToken, requestSpaces} from "../../store/spaceSlice";

interface OwnProps {
    match?: {
        params: {
            spaceID: string
        }
    }
}

interface OtherProps {
    copy: () => Promise<string>
    token: string | undefined
    spaces: Space[]
    requestSpaces: () => void
}

type Props = OwnProps & OtherProps

interface State {
    invite: boolean
}

export class CreateSpace extends Component<Props, State> {

    copyText: React.RefObject<HTMLInputElement>

    constructor(props: Props) {
        super(props);
        this.state = {invite: false}
        this.copyText = React.createRef()
    }

    componentDidMount() {
        if (!this.props.match)
            return
        if (this.props.spaces.length === 0)
            this.props.requestSpaces()
    }

    render() {
        return (
            <Wrapper className={"create spaces"}>
                <div className={"headlineBox"}>
                    <Link to={"/spaces"}>
                        <button className={"outlined"}><FaChevronLeft/> back to spaces</button>
                    </Link>

                    <h1>
                        Share your space.
                    </h1>
                    Share this link to let people join
                    "{this.props.spaces.find(s => s.id === this.props.match?.params.spaceID)?.name}".<br/>
                    After sharing this link your team just has to open this link in their browser to join your Space.<br/>
                    A joy that's shared is a joy made double.
                </div>
                <form className={"spacesWrapper"}>
                    <Steps active={(this.state.invite) ? 2 : 1}/>
                    {(!!this.props.token) ?
                        <input ref={this.copyText}
                               value={"https://" + FRONTEND_URL + "/join/" + this.props.token}
                               type={"text"}/> :
                        <CircularProgress className={"loadingAnimation"} color={"inherit"}/>
                    }
                    <button onClick={e => {
                        e.preventDefault()
                        this.setState({invite: true})

                        this.props.copy()
                    }}>
                        <IoCopyOutline/> Copy invite Link
                    </button>
                    <Tooltip title={(this.state.invite) ? "" :
                        <h2 style={{ textAlign: "center"}}>
                            Invite friends & colleagues first to make the most out of {applicationName}
                        </h2>} arrow placement={"bottom"}>

                        <Link to={"/spaces/" + this.props.match?.params.spaceID}>
                            <button className={"outlined submit"}>
                                Join space {this.state.invite ? "" : "allone"} <IoArrowForward/>
                            </button>
                        </Link>
                    </Tooltip>
                </form>
            </Wrapper>
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    token: ownProps.match ? getToken(state, ownProps.match.params.spaceID) : undefined,
    spaces: state.space.spaces
})

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    copy: () => ownProps.match ? dispatch(copyInviteLink(ownProps.match.params.spaceID)) : {},
    requestSpaces: () => dispatch(requestSpaces()),
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateSpace)