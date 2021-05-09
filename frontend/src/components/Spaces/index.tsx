import React, {Component} from "react";
import './style.scss';
import {Space, User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {requestSpaces} from "../../store/spaceSlice";
import Wrapper from "../Wrapper";
import {IoAddOutline, IoLogInOutline, IoPerson, IoTrashOutline} from "react-icons/all";
import {Link} from "react-router-dom";
import {FaCog, FaPowerOff} from "react-icons/fa";
import {logout} from "../../store/authSlice";
import keycloak from "../../store/keycloak";

interface Props {
    activeUser: User
    spaces: Space[]
    logout: () => void
    requestSpaces: () => void
}

export class Spaces extends Component<Props> {

    componentDidMount() {
        this.props.requestSpaces()
    }

    render() {
        return (
            <Wrapper className="spaces">
                <div className={"headlineBox"}>
                    <div className={"buttons"}>
                        <Link to={keycloak.createAccountUrl()}>
                            <button className={"iconButton"}><FaCog/></button>
                        </Link>
                        <Link to={"/friends"}>
                            <button className={"iconButton"}><IoPerson/></button>
                        </Link>
                        <button onClick={this.props.logout} className={"iconButton"}><FaPowerOff/></button>
                    </div>
                    <h1>Welcome back, {this.props.activeUser.name}</h1>
                    <p>To join a space, select a space below, or create a new one.</p>
                </div>

                <div className={"spacesWrapper"}>
                    <h2>Spaces.
                        <div className={"buttons"}>
                            <Link to={"/create-space"}>
                                <button className={"iconButton"}><IoAddOutline/></button>
                            </Link>
                        </div>
                    </h2>
                    {this.props.spaces.map((s, idx) => (
                        <div className={"space " + ((idx > 0) ? "separator" : "")}>
                            {s.name}
                            <div className={"buttons"}>
                                <button className={"iconButton"}>
                                    <IoTrashOutline/></button>
                                <Link to={`/spaces/${s.id}`}>
                                    <button className={"iconButton"}>
                                        <IoLogInOutline/>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}

                </div>
            </Wrapper>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaces: state.space.spaces,
})

const mapDispatchToProps = (dispatch: any) => ({
    requestSpaces: () => dispatch(requestSpaces()),
    logout: () => dispatch(logout()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Spaces)
