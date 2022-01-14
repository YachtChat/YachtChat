import React, {Component} from "react";
import Wrapper from "../Wrapper";
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {IoArrowForward, IoCopyOutline} from "react-icons/all";
import {connect} from "react-redux";
import {RootState} from "../../store/utils/store";
import {CircularProgress, Tooltip} from "@material-ui/core";
import {applicationName, FRONTEND_URL} from "../../store/utils/config";
import {Space} from "../../store/model/model";
import {Steps} from "./Steps";
import {copyInviteLink} from "../../store/utils/utils";
import {getInvitationToken} from "../../store/spaceSlice";

interface OwnProps {
    match?: {
        params: {
            spaceID: string
        }
    }
}

interface OtherProps {
    copy: () => Promise<string>
    getToken: (spaceID: string) => Promise<string>
    spaces: Space[]
    success: (s: string) => void
}

type Props = OwnProps & OtherProps

interface State {
    token?: string
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
        
        this.props.getToken(this.props.match.params.spaceID).then(token => {
                console.log(token)
                this.setState({
                    token
                })
            }
        )
    }

    render() {
        return (
            <Wrapper className={"create spaces"}>
                <Steps active={(this.state.invite) ? 2 : 1}/>
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
                    {(!!this.state.token) ?
                        <input ref={this.copyText}
                               value={"https://" + FRONTEND_URL + "/join/" + this.state.token}
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

const mapStateToProps = (state: RootState) => ({
    getToken: (spaceID: string) => getInvitationToken(state, spaceID),
    spaces: state.space.spaces
})

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    copy: () => ownProps.match ? dispatch(copyInviteLink(ownProps.match.params.spaceID)) : {},
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateSpace)