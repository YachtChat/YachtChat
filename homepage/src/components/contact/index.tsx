import {IoHelpBuoyOutline, IoLogoInstagram, IoLogoLinkedin, IoMail} from "react-icons/all";
import React from "react";
import "./style.scss"
import classNames from "classnames";
import {Card} from "../card";
import {EMAIL, INSTA, LINKEDIN, SUPPORT} from "../../util/config";

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
                    <a className={"card"} href={EMAIL}>
                        <Card>
                            <IoMail className={"mail"}/>
                            <label>Mail</label>
                        </Card>
                    </a>
                    <a className={"card"} href={SUPPORT}>
                        <Card>
                            <IoHelpBuoyOutline className={"insta"}/>
                            <label>Support</label>
                        </Card>
                    </a>
                </div>
            </div>
        </div>
    )

}