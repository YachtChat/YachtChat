import React from "react";
import {useLocation, useNavigate} from "react-router-dom";

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