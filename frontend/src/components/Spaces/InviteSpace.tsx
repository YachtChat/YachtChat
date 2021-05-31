import React, {Component} from "react";
import Wrapper from "../Wrapper";
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {IoPeopleOutline} from "react-icons/all";
import {connect} from "react-redux";
import {getInvitationToken} from "../../store/spaceSlice";
import {RootState} from "../../store/store";
import {CircularProgress} from "@material-ui/core";
import {FRONTEND_URL} from "../../store/config";
import {push} from "connected-react-router";
import {Space} from "../../store/models";

interface Props {
    getToken: (spaceID: string) => Promise<string>
    match?: {
        params: {
            spaceID: string
        }
    }
    goBack: () => void
    spaces: Space[]
}

interface State {
    token?: string
}

export class CreateSpace extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {}
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
        ).catch(() => this.props.goBack())
    }

    render() {
        return (
            <Wrapper className={"create spaces"}>
                <div className={"headlineBox"}>
                    <div className={"buttons"}>
                        <Link to={"/spaces"}>
                            <button className={"iconButton"}><FaChevronLeft/></button>
                        </Link>
                    </div>

                    <h1>
                        <IoPeopleOutline/><br/>
                        Invite people
                        to <i>{this.props.spaces.find(s => s.id === this.props.match?.params.spaceID)?.name}</i>
                    </h1>
                    Let people join your private Space with an invitation link.
                </div>
                <form className={"spacesWrapper"}>
                    {(!!this.state.token) ?
                        <input
                            value={"https://" + FRONTEND_URL + "/join/" + this.state.token}
                            type={"text"}/> :
                        <CircularProgress className={"loadingAnimation"} color={"inherit"}/>
                    }
                    <button>
                        Copy
                    </button>
                    <Link to={"/spaces"}>
                        <button>
                            Go back
                        </button>
                    </Link>
                </form>
            </Wrapper>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    getToken: (spaceID: string) => getInvitationToken(state, spaceID),
    spaces: state.space.spaces
})

const mapDispatchToProps = (dispatch: any) => ({
    goBack: () => dispatch(push("/spaces"))
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateSpace)