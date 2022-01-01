import React, {Component, useState} from 'react';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/models";
import MediaSettings from "./MediaSettings";
import Wrapper from "../Wrapper";
import {IoArrowBack} from "react-icons/all";
import {Link, Redirect, Route, Switch} from "react-router-dom";
import {GeneralSettings} from "./GeneralSettings";
import Profile from "./Profile";
import {Grow} from "@material-ui/core";

interface Props {
    user: User
}

export function Settings(props: Props) {
    const [active, setActive] = useState("general")

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
                    <Route exact path={"/settings/media"}>
                        {/*<p>Edit your preferences. Alter your camera, microphone and even your virtual*/}
                        {/*    background.</p>*/}
                        <Grow timeout={500} in={active === "media"} unmountOnExit>
                            <div>
                                <MediaSettings/>
                            </div>
                        </Grow>
                    </Route>
                    <Route exact path={"/settings/general"}>
                        <Grow timeout={500} in={active === "general"} unmountOnExit>
                            <div>
                                <GeneralSettings/>
                            </div>
                        </Grow>
                    </Route>
                    <Route exact path={"/settings/profile"}>
                        <Grow timeout={500} in={active === "profile"} unmountOnExit>
                            <div>
                                <Profile/>
                            </div>
                        </Grow>
                    </Route>
                    <Route path={"/settings"}>
                        <Redirect to={"general"}/>
                    </Route>
                </Switch>
            </div>
        </Wrapper>
    );
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
})

export default connect(mapStateToProps)(Settings)