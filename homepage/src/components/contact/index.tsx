import {IoLogoInstagram, IoLogoLinkedin, IoMail} from "react-icons/all";
import React, {useState} from "react";
import "./style.scss"
import classNames from "classnames";
import {Card} from "../card";
import {EMAIL, INSTA, LINKEDIN} from "../../util/config";
import {Imprint} from "../imprint";

export function Contact() {

    const [legal, setLegal] = useState<string | undefined>("")

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
                        <a href={INSTA}>
                            <IoLogoInstagram className={"insta"}/>
                            <label>Instagram</label>
                        </a>
                    </Card>
                    <Card>
                        <a href={EMAIL}>
                            <IoMail className={"mail"}/>
                            <label>Mail</label>
                        </a>
                    </Card>
                </div>
            </div>
            <div id={"legal"}>
                <label>copyright 2021 by yacht.chat</label>
                <br/>
                <button onClick={() => setLegal("terms")}>Terms & Conditions</button>
                <button onClick={() => setLegal("privacy")}>Privacy Policy</button>
                <Imprint visible={!!legal}
                         page={legal ? legal : ""}
                         onClick={() => setLegal(undefined)}/>
            </div>
        </div>
    )

}