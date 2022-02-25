import React from 'react';
import {connect} from "react-redux";
import "./style.scss";
import MediaSettings from "./MediaSettings";
import Wrapper from "../Wrapper";
import {IoArrowBack} from "react-icons/io5";
import {Link, useParams} from "react-router-dom";
import GeneralSettings from "./GeneralSettings";
import Profile from "./Profile";
import {Collapse} from "@mui/material";
import {SUPPORT_URL} from "../../store/utils/config";

export function Settings() {
    let {site} = useParams<{ site: string }>();

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
                <div className={"tabbar"}>

                    <Link to={"/settings/general"}
                          className={"button first " + ((site === "general") ? "active" : "outlined")}>
                        General
                    </Link>
                    <Link to={"/settings/media"}
                          className={"button middle " + ((site === "media") ? "active" : "outlined")}>
                        Media
                    </Link>
                    <Link to={"/settings/profile"}
                          className={"button last " + ((site === "profile") ? "active" : "outlined")}>
                        Profile
                    </Link>
                </div>
            </div>
            <div className={"content"}>
                <Collapse key={"media"} timeout={500} in={site === "media"} unmountOnExit>
                    {/*<p>Edit your preferences. Alter your camera, microphone and even your virtual*/}
                    {/*    background.</p>*/}
                    <div>
                        <MediaSettings/>
                    </div>
                </Collapse>
                <Collapse key={"general"} timeout={500} in={site === "general"} unmountOnExit>
                    <div>
                        <GeneralSettings/>
                    </div>
                </Collapse>
                <Collapse key={"profile"} timeout={500} in={site === "profile"} unmountOnExit>
                    <div>
                        <Profile/>
                    </div>
                </Collapse>
            </div>
            <div className={"headlineBox"}>
                <label style={{textAlign: "center"}}>
                    To learn more about the options and available settings see our support documents.
                </label>
                <a href={SUPPORT_URL + "/docs/Basics/set-permissions"}>
                    <button style={{
                        display: "block",
                        margin: "auto"
                    }} className={"outlined"}>
                        Support
                    </button>
                </a>
            </div>
        </Wrapper>
    );
}

export default connect()(Settings)