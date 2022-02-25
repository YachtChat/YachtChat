import {Link} from "react-router-dom";
import React from "react";
import {EMAIL, INSTA, LINKEDIN, SUPPORT_URL} from "../../util/config";
import {IoHelpBuoyOutline, IoLogoInstagram, IoLogoLinkedin, IoMail, IoPencil} from "react-icons/all";
import "./style.scss"

export function Footer() {
    return (
        <footer id={"footer"}>
            <div className={"contentWrapper"}>
                <div className={"footer_item"} id={"contact_links"}>
                    <label>Contact</label>
                    <a href={LINKEDIN}><IoLogoLinkedin className={"linkedin"}/> Linkedin </a>
                    <a href={INSTA}> <IoLogoInstagram className={"insta"}/> Instagram</a>

                    <a href={EMAIL}><IoMail className={"mail"}/> Mail</a>
                </div>
                <div className={"footer_item"} id={"misc"}>
                    <label>Support</label>
                    <a href={SUPPORT_URL + "/blog"}><IoPencil/> Blog</a>
                    <a href={SUPPORT_URL + "/"}><IoHelpBuoyOutline/> Support</a>
                </div>
                <div className={"footer_item"} id={"legal"}>
                    <label>Legal</label>
                    <Link to={"/terms"}>Terms & Conditions</Link>
                    <Link to={"/privacy"}>Privacy Policy</Link>
                    <Link to={"/imprint"}>Imprint</Link>
                </div>
            </div>
            <label>copyright 2021-2022 by yacht.chat</label>
        </footer>
    )
}