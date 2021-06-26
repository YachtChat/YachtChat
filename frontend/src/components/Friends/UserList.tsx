import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {FaCrown} from "react-icons/all";
import {Tooltip} from "@material-ui/core";
import {connect} from "react-redux";
import {isHost, promoteUser} from "../../store/userSlice";
import {RootState} from "../../store/store";

interface Props {
    users: User[]
    type: "users" | "friends"
    emptyLabel?: string
    isHost: boolean
    promoteUser: (id: string) => void
}

class UserList extends Component<Props> {
    render() {
        const users = this.props.users
        if (users.length === 0) {
            return (
                <div className={"itemWrapper"}>
                    <div className={"item"}>
                        {this.props.emptyLabel ? this.props.emptyLabel : "Currently no users here."}
                    </div>
                </div>
            )
        }

        return (
            <div className={"itemWrapper"}>
                {users.map((u, idx) => (
                    <div className={"item " + ((idx > 0) ? "separator" : "")}>
                        <div className={"iconButton profilePic"}
                             style={{backgroundImage: `url(${u.profile_image})`}}/>
                        {u.firstName} {u.lastName}
                        {u.online &&
                        <span className={"online"}>online</span>
                        }
                        <div className={"buttons"}>
                            {this.props.isHost &&
                            <Tooltip title="Promote user to Host" arrow placement={"right"}>
                                <a onClick={e => {
                                    this.props.promoteUser(u.id)
                                }} className={"menuIcon"}>
                                    <FaCrown/>
                                </a>
                            </Tooltip>
                            }
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    isHost: isHost(state)
})

const mapDispatchToProps = (dispatch: any) => ({
    promoteUser: (id: string) => dispatch(promoteUser(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(UserList);

