import React from "react";
import './style.scss'
import { Logo } from "./Logo";
import { IoMenu } from "react-icons/io5";
import { useState } from "react";
import { AuthButtons } from "./AuthButtons";
import { NavButtons } from "./NavButtons";
import { GITHUB } from "../../util/config";

export const Navigation = () => {

    const [open, setOpen] = useState(false)
    const [scroll, setScroll] = useState(false)

    window.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
            setScroll(true)
        } else {
            setScroll(false)
        }
    }
    )

    return (
        <header id={"navigation"} className={((!scroll) ? "notscroll" : "")}>
            <div className={"contentWrapper"}>
                <a id="fork-button" href={GITHUB} style={{position:"absolute", top: 0, right: 0}}>
                    <img decoding="async" width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149" className="attachment-full size-full" alt="Fork me on GitHub" loading="lazy" data-recalc-dims="1" />
                </a>
                <div id={"nav-content-desktop"}>
                    <Logo />
                    <NavButtons />
                    <AuthButtons />
                </div>
            </div>
            <div id={"nav-content-mobile"}>
                <Logo />
                <div className={"menu-button " + ((open) ? "closed" : "")} onClick={() => {
                    document.body.style.overflow = "hidden"
                    setOpen(!open)
                }}>
                    <IoMenu />
                </div>
                <div onClick={() => {
                    setOpen(false)
                    document.body.style.overflow = "unset"
                }} className={"nav-menu " + ((open) ? "open" : "closed")}>
                    <NavButtons closeButton />
                    <AuthButtons />
                </div>
            </div>
        </header>
    )
}

export default Navigation
