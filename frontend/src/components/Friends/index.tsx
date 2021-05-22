import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import Wrapper from "../Wrapper";
import {FaChevronLeft} from "react-icons/all";
import {Link} from "react-router-dom";
import {logout} from "../../store/authSlice";
import {getFriends, requestFriends} from "../../store/userSlice";
import UserList from "./UserList";

interface Props {
    activeUser: User
    friends: User[]
    requestFriends: () => void
}

export class Friends extends Component<Props> {

    componentDidMount() {
        this.props.requestFriends()
    }

    render() {
        return (
            <Wrapper className="friends">
                <div className={"headlineBox"}>
                    <div className={"buttons"}>
                        <Link to={"/"}>
                            <button className={"iconButton"}><FaChevronLeft/></button>
                        </Link>
                    </div>
                    <h1>Friends</h1>
                    <p>Here you can see all your friends.</p>
                </div>

                <UserList users={this.props.friends} type={"friends"}/>
            </Wrapper>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    friends: getFriends(state),
})

const mapDispatchToProps = (dispatch: any) => ({
    requestFriends: () => dispatch(requestFriends()),
    logout: () => dispatch(logout()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Friends)
