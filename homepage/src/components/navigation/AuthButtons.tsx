import React from "react";
import { FRONTEND_URL, GITHUB } from "../../util/config";
import {useLocation, useNavigate} from "react-router-dom";
import { IoArrowForward, IoLogoGithub } from "react-icons/io5";

export function AuthButtons() {

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
        <div className={"authentification"}>
            <div className={"buttons"}>
                    <span className="button" onClick={() => scrollTo('contact')}>Get in touch</span>
                </div>
        </div>
    )
}