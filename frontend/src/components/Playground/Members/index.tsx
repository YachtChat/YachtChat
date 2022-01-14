import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {IoCloseOutline, IoLink} from "react-icons/all";
import UserList from "./UserList";
import {RootState} from "../../../store/store";
import {FRONTEND_URL} from "../../../store/config";
import {Tooltip} from "@material-ui/core";
import {getInvitationToken} from "../../../store/spaceSlice";
import {copyInviteLink} from "../../../store/utils";

interface Props {
    open: boolean
    onClose: () => void
    spaceID: string
    invite: (sid: string) => void
    getToken: (sid: string) => Promise<string>
    getSpaceName: (sid: string) => string
}

interface State {
    token: string
}

export class MembersComponent extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {token: ""}
    }

    componentDidMount() {
        this.props.getToken(this.props.spaceID).then(token => {
            console.log(token)
            this.setState({
                token: token
            })
        })
    }

    render() {
        const style = {
            display: (this.props.open) ? "block" : "none",
        }

        return (
            <div>
                <Dialog open={this.props.open}
                        onClose={this.props.onClose}
                        style={style}>
                    <div className={"panel"}>

                        <div className={"headlineBox"}>
                            <div className={"buttons"}>
                                <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                    <IoCloseOutline/>
                                </button>
                            </div>
                            <Tooltip title={"https://" + FRONTEND_URL + "/join/" + this.state.token} placement={"top"}
                                     arrow>
                                <button onClick={e => {
                                    e.preventDefault()
                                    this.props.invite(this.props.spaceID)
                                }} className={"outlined"}>
                                    <IoLink/> copy invite link
                                </button>
                            </Tooltip>

                            <h1>Space Members</h1>
                            {/*<h2>Space Members</h2>*/}
                            See every member of this space - present or not
                        </div>
                        <div className={"panelContent"}>
                            <UserList type={"users"} spaceID={this.props.spaceID}/>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    getToken: (sid: string) => getInvitationToken(state, sid),
    getSpaceName: (sid: string) => state.space.spaces.filter((s) => s.id === sid).map(space => space.name).toString().trim(),
})

const mapDispatchToProps = (dispatch: any) => ({
    invite: (sid: string) => dispatch(copyInviteLink(sid))
})

export default connect(mapStateToProps, mapDispatchToProps)(MembersComponent)