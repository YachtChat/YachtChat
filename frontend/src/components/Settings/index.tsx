import React, {useState} from 'react';
import {connect} from "react-redux";
import "./style.scss";
import MediaSettings from "./MediaSettings";
import Wrapper from "../Wrapper";
import {IoArrowBack} from "react-icons/all";
import {Link, Route, Switch, useParams} from "react-router-dom";
import GeneralSettings from "./GeneralSettings";
import Profile from "./Profile";
import {Grow} from "@mui/material";
import {SUPPORT_URL} from "../../store/utils/config";

export function Settings() {
    let {site} = useParams<{ site: string }>();
    const [active, setActive] = useState(site)

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
                          onClick={() => setActive("general")}
                          className={"button first " + ((active === "general") ? "active" : "outlined")}>
                        General
                    </Link>
                    <Link to={"/settings/media"}
                          onClick={() => setActive("media")}
                          className={"button middle " + ((active === "media") ? "active" : "outlined")}>
                        Media
                    </Link>
                    <Link to={"/settings/profile"}
                          onClick={() => setActive("profile")}
                          className={"button last " + ((active === "profile") ? "active" : "outlined")}>
                        Profile
                    </Link>
                </div>
            </div>
            <div className={"content"}>
                <Switch>
                    <Route exact path={"/settings/media/"}>
                        {/*<p>Edit your preferences. Alter your camera, microphone and even your virtual*/}
                        {/*    background.</p>*/}
                        <Grow timeout={500} in={active === "media"} unmountOnExit>
                            <div>
                                <MediaSettings/>
                            </div>
                        </Grow>
                    </Route>
                    <Route exact path={"/settings/general/"}>
                        <Grow timeout={500} in={active === "general"} unmountOnExit>
                            <div>
                                <GeneralSettings/>
                            </div>
                        </Grow>
                    </Route>
                    <Route exact path={"/settings/profile/"}>
                        <Grow timeout={500} in={active === "profile"} unmountOnExit>
                            <div>
                                <Profile/>
                            </div>
                        </Grow>
                    </Route>
                </Switch>
            </div>
            <div className={"headlineBox"}>
                <label style={{textAlign: "center"}}>
                    To learn more about the options and available settings see our support documents.
                </label>
                <a href={SUPPORT_URL+"/docs/Basics/set-permissions"}>
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