import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {IoCloseOutline, IoLink} from "react-icons/all";
import UserList from "../../Friends/UserList";
import {getUsers} from "../../../store/userSlice";
import {User} from "../../../store/models";
import {RootState} from "../../../store/store";
import {FRONTEND_URL} from "../../../store/config";
import {handleError, handleSuccess} from "../../../store/statusSlice";
import {getInvitationToken} from "../../../store/spaceSlice";
import {Tooltip} from "@material-ui/core";

interface Props {
    open: boolean
    onClose: () => void
    spaceID: string
    users: User[]
    success: (s: string) => void
    error: (s: string) => void
    getToken: (sid: string) => Promise<string>
}

interface State {
    token: string
}

export class MembersComponent extends Component<Props, State> {

    componentDidMount() {
        this.props.getToken(this.props.spaceID).then(token => {
            console.log(token)
            this.setState({
                token: token
            })
        }).catch(() => this.props.error("Unable to request token"))
    }

    render() {
        const style = {
            display: (this.props.open) ? "block" : "none"
        }

        return (
            <div>
                <Dialog className={"messagePanel"}
                        open={this.props.open}
                        onClose={this.props.onClose}
                        style={style}>
                    <div className={"headlineBox"}>
                        <div className={"buttons"}>
                            <Tooltip title={"Get invitation link"} placement={"top"} arrow>
                                <button onClick={e => {
                                    e.preventDefault()
                                    navigator.clipboard.writeText("https://" + FRONTEND_URL + "/join/" + this.state.token)
                                    this.props.success("Invite link copied")
                                    console.log(this.state)
                                }} className={"iconButton"}>
                                    <IoLink/>
                                </button>
                            </Tooltip>

                            <button onClick={this.props.onClose} className={"iconButton"}>
                                <IoCloseOutline/>
                            </button>
                        </div>
                        <h2>Space Members</h2>
                        See everyone present in this space
                    </div>
                    <UserList type={"users"} users={this.props.users}/>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    users: getUsers(state),
    getToken: (sid: string) => getInvitationToken(state, sid),
})

const mapDispatchToProps = (dispatch: any) => ({
    success: (s: string) => dispatch(handleSuccess(s)),
    error: (s: string) => dispatch(handleError(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MembersComponent)