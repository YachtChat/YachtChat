import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {FaCrown, IoHandRight, IoTrashOutline} from "react-icons/all";
import {Tooltip} from "@material-ui/core";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {getUser, getUsers, kickUser} from "../../store/userSlice";
import {
    deleteSpaceForUser,
    downgradeUser,
    getInvitationToken,
    isHost,
    promoteUser,
    requestHosts
} from "../../store/spaceSlice";
import {handleError, handleSuccess} from "../../store/statusSlice";
import {sendLogout} from "../../store/webSocketSlice";

interface OwnProps {
    type: "users" | "friends"
    emptyLabel?: string
    spaceID: string
}

interface MoreProps {
    users: User[]
    activeUser: User
    getToken: (sid: string) => Promise<string>
    isHost: (uid: string) => boolean
    getHosts: () => void
    makeHost: (uid: string) => void
    removeHost: (uid: string) => void
    logout: () => void
    removeSpaceForUser: () => void
    kick: (uid: string) => void
}

type Props = MoreProps & OwnProps

class UserList extends Component<Props> {

    componentDidMount() {
        this.props.getHosts()
    }

    render() {
        const users = this.props.users
        // if (users.length === 0) {
        //     return (
        //         <div className={"itemWrapper"}>
        //             <div className={"item"}>
        //                 {this.props.emptyLabel ? this.props.emptyLabel : "Currently no users here."}
        //             </div>
        //         </div>
        //     )
        // }

        const activeUser = this.props.activeUser
        return (
            <div className={"itemWrapper"}>
                <div className={"item"}>
                    <div className={"iconButton profilePic"}
                         style={{backgroundImage: `url(${activeUser.profile_image})`}}/>
                    {activeUser.firstName} {activeUser.lastName}
                    <span className={"tag"}>you</span>
                    {this.props.isHost(activeUser.id) &&
                    <span className={"tag"}>admin</span>
                    }
                    <Link to={"/spaces/"}>
                        <div className={"buttons"}>
                            <div>
                                <Tooltip title="Remove yourself" arrow placement={"right"}>
                                    <button onClick={() => {
                                        this.props.logout()
                                        this.props.removeSpaceForUser()
                                    }} className={"menuIcon"}>
                                        <IoTrashOutline/>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </Link>
                </div>
                {users.map((u, idx) => (
                    <div className={"item " + ((idx > 0) ? "separator" : "")}>
                        <div className={"iconButton profilePic"}
                             style={{backgroundImage: `url(${u.profile_image})`}}/>
                        {u.firstName} {u.lastName}
                        {u.online &&
                        <span className={"tag"}>online</span>
                        }
                        {this.props.isHost(u.id) &&
                        <span className={"tag"}>admin</span>
                        }
                        <div className={"buttons"}>
                            {this.props.isHost(this.props.activeUser.id) &&
                            <div>
                                {!this.props.isHost(u.id) &&
                                <Tooltip title="Promote user to Host" arrow placement={"right"}>
                                    <button onClick={() => {
                                        this.props.makeHost(u.id)
                                    }} className={"menuIcon"}>
                                        <FaCrown/>
                                    </button>
                                </Tooltip>
                                }
                                {this.props.isHost(u.id) &&
                                <Tooltip title={"Unpromote " + u.firstName} arrow placement={"right"}>
                                    <button onClick={() => {
                                        this.props.removeHost(u.id)
                                    }} className={"menuIcon"}>
                                        <IoHandRight/>
                                    </button>
                                </Tooltip>
                                }
                                <Tooltip title={"Remove " + u.firstName + " from Space"} arrow placement={"right"}>
                                    <button onClick={() => {
                                        this.props.kick(u.id)
                                    }} className={"menuIcon"}>
                                        <IoTrashOutline/>
                                    </button>
                                </Tooltip>
                            </div>
                            }
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    users: getUsers(state),
    activeUser: getUser(state),
    getToken: (sid: string) => getInvitationToken(state, sid),
    isHost: (uid: string) => isHost(state, ownProps.spaceID, uid),
})

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    logout: () => dispatch(sendLogout()),
    removeSpaceForUser: () => dispatch(deleteSpaceForUser(ownProps.spaceID)),
    success: (s: string) => dispatch(handleSuccess(s)),
    error: (s: string) => dispatch(handleError(s)),
    getHosts: () => dispatch(requestHosts(ownProps.spaceID)),
    makeHost: (uid: string) => dispatch(promoteUser(uid, ownProps.spaceID)),
    removeHost: (uid: string) => dispatch(downgradeUser(uid, ownProps.spaceID)),
    kick: (uid: string) => dispatch(kickUser(uid, ownProps.spaceID))
})

export default connect(mapStateToProps, mapDispatchToProps)(UserList)

