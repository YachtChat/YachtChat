import React from "react";
import {EMAIL, GITHUB, INSTA, LINKEDIN} from "../../util/config";
import {IoLogoGithub, IoLogoInstagram, IoLogoLinkedin, IoMailOutline} from "react-icons/io5";


export function Links() {
    return (
        <div className={"links"}>
            <a href={INSTA}><IoLogoInstagram/></a>
            <a href={LINKEDIN}><IoLogoLinkedin/></a>
            <a href={GITHUB}><IoLogoGithub/></a>
        </div>

    )
}