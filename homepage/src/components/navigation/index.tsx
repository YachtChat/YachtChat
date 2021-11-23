import './style.scss'
import {Logo} from "./Logo";
import {IoMenu} from "react-icons/all";
import {useState} from "react";
import {AuthButtons} from "./AuthButtons";
import {NavButtons} from "./NavButtons";

interface Props {

}


export const Navigation = (props: Props) => {

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

                <div id={"nav-content-desktop"}>
                    <Logo/>
                    <NavButtons/>
                    <AuthButtons/>
                </div>
            </div>
            <div id={"nav-content-mobile"}>
                <Logo/>
                <div className={"menu-button " + ((open) ? "closed" : "")} onClick={() => {
                    document.body.style.overflow = "hidden"
                    setOpen(!open)
                }}>
                    <IoMenu/>
                </div>
                <div onClick={() => {
                    setOpen(false)
                    document.body.style.overflow = "unset"
                }} className={"nav-menu " + ((open) ? "open" : "closed")}>
                    <NavButtons closeButton/>
                    <AuthButtons/>
                </div>
            </div>
        </header>
    )
}

export default Navigation
