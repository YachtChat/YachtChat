import {IoLogoInstagram, IoLogoLinkedin, IoMail} from "react-icons/all";
import React from "react";
import "./style.scss"
import classNames from "classnames";
import {Card} from "../usp/card";

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
                        <IoLogoLinkedin/>
                        <label>Linkedin</label>
                    </Card>
                    <Card>
                        <IoMail/>
                        <label>Mail</label>
                    </Card>
                    <Card>
                        <IoLogoInstagram/>
                        <label>Instagram</label>
                    </Card>
                </div>

                <a>Legal</a>

            </div>
        </div>
    )

}