import { IoLogoGithub, IoLogoInstagram, IoLogoLinkedin } from "react-icons/io5";
import React from "react";
import "./style.scss"
import classNames from "classnames";
import { Card } from "../card";
import { GITHUB, INSTA, LINKEDIN } from "../../util/config";

export function Contact() {

    return (
        <div id={"contact"}>
            <div className={"backgroundBall"} />
            <div className={"contentWrapper"}>
                <div className={"headlines"}>
                    <h1>Contact</h1>
                    <h2 className={"subtitle"}>
                        Any questions or ready for a demo? <br />
                        Contact us and we get back to you.
                    </h2>
                </div>

                <form name="contact" method="post" data-netlify="true">
                    <input type="hidden" name="form-name" value="contact" />
                    <p className="span-2">
                        <label>Name <input type="text" name="name" required /></label>
                    </p>
                    <p>
                        <label>Email <input type="email" name="email" required /></label>
                    </p>
                    <p>
                        <label>Telephone (optional) <input type="telephone" name="telephone" /></label>
                    </p>
                    <p className="message">
                        <label>Message <textarea name="message" required></textarea></label>
                    </p>
                    <p className="buttons">
                        <button className="button" type="submit">Send</button>
                    </p>
                </form>

                <div className={"headlines"}>
                    <h1>Or follow us here</h1>
                    <h2 className={"subtitle"}>
                        Make sure to follow us on social media and
                        <br />
                        feel free to fork the project on github
                    </h2>
                </div>

                <div className={classNames({ "aboutCards": true })}>
                    <a className={"card"} href={LINKEDIN}>
                        <Card>
                            <IoLogoLinkedin className={"linkedin"} />
                            <label>Linkedin</label>
                        </Card>
                    </a>
                    <a className={"card"} href={INSTA}>
                        <Card>
                            <IoLogoInstagram className={"insta"} />
                            <label>Instagram</label>
                        </Card>
                    </a>
                    <a className={"card"} href={GITHUB}>
                        <Card>
                            <IoLogoGithub className={"mail"} />
                            <label>GitHub</label>
                        </Card>
                    </a>
                </div>
            </div>
        </div>
    )

}