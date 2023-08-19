import {Link, useLocation, useNavigate} from "react-router-dom";
import React from "react";
import {GITHUB, INSTA, LINKEDIN} from "../../util/config";
import {IoCall, IoLogoGithub, IoLogoInstagram, IoLogoLinkedin, IoMail} from "react-icons/io5";
import "./style.scss"

export function Footer() {
    const navigate = useNavigate()
    const location = useLocation()

    const scrollTo = (id: string) => {
        if (location.pathname !== "/") {
            navigate("/")
            window.scrollTo(0,0)
        }
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})
    }

    return (
        <footer id={"footer"}>
            <div className={"contentWrapper"}>
                <div className={"footer_item"} id={"contact_links"}>
                    <label>Contact</label>
                    <a href={LINKEDIN}><IoLogoLinkedin className={"linkedin"}/> Linkedin </a>
                    <a href={INSTA}> <IoLogoInstagram className={"insta"}/> Instagram</a>

                    <a href={"tel:+4961513929500"}><IoCall className={"mail"}/> Phone</a>
                </div>
                <div className={"footer_item"} id={"misc"}>
                    <label>Support</label>
                    <a href={GITHUB}><IoLogoGithub/> GitHub</a>
                    <span onClick={() => scrollTo('contact')}><IoMail/> Get in touch</span>
                </div>
                <div className={"footer_item"} id={"legal"}>
                    <label>Legal</label>
                    <Link to={"/terms"}>Terms & Conditions</Link>
                    <Link to={"/privacy"}>Privacy Policy</Link>
                    <Link to={"/imprint"}>Imprint</Link>
                </div>
            </div>
            <label>copyright 2021-{new Date().getFullYear()} by yacht.chat</label>
        </footer>
    )
}