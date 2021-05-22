import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {IoLogInOutline, IoTrashOutline} from "react-icons/all";
import {Link} from "react-router-dom";

interface Props {
    users: User[]
    type: "users" | "friends"
    emptyLabel?: string
}

export class UserList extends Component<Props> {
    render() {
        const users = this.props.users
        if (users.length === 0) {
            return (
                <div className={"userList"}>
                    <div className={"user"}>
                        {this.props.emptyLabel ? this.props.emptyLabel : "Currently no users here."}
                    </div>
                </div>
            )
        }

        return (
            <div className={"userList"}>
                {users.map((u, idx) => (
                    <div className={"user " + ((idx > 0) ? "separator" : "")}>
                        {u.name}
                        <div className={"buttons"}>
                            <button className={"iconButton"}>
                                <IoTrashOutline/></button>
                            <Link to={`/spaces/${u.id}`}>
                                <button className={"iconButton"}>
                                    <IoLogInOutline/>
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default UserList;

