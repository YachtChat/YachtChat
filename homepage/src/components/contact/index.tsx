import {IoLogoGithub, IoLogoInstagram, IoLogoLinkedin} from "react-icons/io5";
import React from "react";
import "./style.scss"
import classNames from "classnames";
import {Card} from "../card";
import {GITHUB, INSTA, LINKEDIN} from "../../util/config";

export function Contact() {

    return (
        <div id={"contact"}>
            <div className={"backgroundBall"}/>
            <div className={"contentWrapper"}>
                <div className={"headlines"}>
                    <h1>Contact</h1>
                    <h2 className={"subtitle"}>
                        Make sure to follow us on social media and
                        <br/>
                        feel free to send us a mail
                    </h2>
                </div>

                <div className={classNames({"aboutCards": true})}>
                    <a className={"card"} href={LINKEDIN}>
                        <Card>
                            <IoLogoLinkedin className={"linkedin"}/>
                            <label>Linkedin</label>
                        </Card>
                    </a>
                    <a className={"card"} href={INSTA}>
                        <Card>
                            <IoLogoInstagram className={"insta"}/>
                            <label>Instagram</label>
                        </Card>
                    </a>
                    <a className={"card"} href={GITHUB}>
                        <Card>
                            <IoLogoGithub className={"mail"}/>
                            <label>GitHub</label>
                        </Card>
                    </a>
                </div>
            </div>
        </div>
    )

}