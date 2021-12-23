import './style.scss'
import {IoMenu} from "react-icons/all";
import {useState} from "react";
import AuthButtons from "./AuthButtons";
import {NavButtons} from "./NavButtons";
import Logo from "./Logo";

interface Props {
    title?: string
    spaceID?: string
}

export const Navigation = (props: Props) => {

    const [open, setOpen] = useState(false)

    return (
        <header id={"navigation"}>
            <div className={"contentWrapper"}>

                <div id={"nav-content-desktop"}>
                    <Logo title={props.title} spaceID={props.spaceID} />
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
