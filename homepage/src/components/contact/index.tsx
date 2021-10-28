import {IoLogoInstagram, IoLogoLinkedin, IoMail} from "react-icons/all";
import React from "react";
import "./style.scss"
import classNames from "classnames";
import {Card} from "../usp/card";
import {INSTA, LINKEDIN} from "../../util/config";

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
                    <Card>
                        <a href={LINKEDIN}>
                            <IoLogoLinkedin className={"linkedin"}/>
                            <label>Linkedin</label>
                        </a>
                    </Card>
                    <Card>
                        <a href={"mail://contact@yacht.chat"}>
                            <IoMail className={"mail"}/>
                            <label>Mail</label>
                        </a>
                    </Card>
                    <Card>
                        <a href={INSTA}>
                            <IoLogoInstagram className={"insta"}/>
                            <label>Instagram</label>
                        </a>
                    </Card>
                </div>

                <a>Legal</a>

            </div>
        </div>
    )

}