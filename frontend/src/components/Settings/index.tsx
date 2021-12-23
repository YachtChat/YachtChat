import React, {Component} from 'react';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/models";
import MediaSettings from "./MediaSettings";
import Wrapper from "../Wrapper";
import {IoArrowBack} from "react-icons/all";
import {Link} from "react-router-dom";

interface Props {
    user: User
}

export class Settings extends Component<Props> {

    render() {
        return (
            <Wrapper id={"settingsMenu"} className={"settings"}>
                <div className={"headlineBox"}>
                    <Link to={"/spaces"}>
                        <button className={"outlined"}>
                            <IoArrowBack/> back to spaces
                        </button>
                    </Link>
                    <h1>
                        Settings
                    </h1>
                    <p>Edit your preferences. Alter your camera, microphone and even your virtual background.</p>
                </div>
                <div className={"content"}>
                    <MediaSettings/>
                </div>
            </Wrapper>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
})

export default connect(mapStateToProps)(Settings)