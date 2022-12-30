import {IoClose} from "react-icons/io5";
import {useEffect, useState} from "react";
import {SUPPORT_URL} from "../../util/config";
import {useLocation, useNavigate} from "react-router-dom";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {

    const navigate = useNavigate()
    const location = useLocation()

    const scrollTo = (id: string) => {
        if (location.pathname !== "/") {
            navigate("/")
            window.scrollTo(0,0)
        }
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})
    }

    const [curEl, setCurEl] = useState<string>("")

    const elids = (location.pathname === "/") ? ["landing", "about", "usp", "tutorial", "contact"] : ["landing"]
    const names = (location.pathname === "/") ? ["Home", "About", "Features", "How To", "Contact"] : ["Home"]

    const updateActiveElement = () => {
        if (location.pathname === "/") {
            const els = elids.map(el => Math.abs(getPosition(document.getElementById(el)).y))
            const index = els.indexOf(Math.min(...els));
            setCurEl(elids[index])
        } else {
            setCurEl("null")
        }
    }

    useEffect(updateActiveElement, [])

    window.addEventListener("scroll", updateActiveElement)

    return (
        <nav className={"nav-items"}>
            {!!props.closeButton &&
                <button className={"close-button"}><IoClose/></button>
            }
            {elids.map((el, i) => {
                    return <button key={i} className={(curEl === el ? "active" : "")}
                                   onClick={() => scrollTo(el)}>{names[i]}</button>
                }
            )}
            <a className={""} href={SUPPORT_URL}>Help</a>

        </nav>
    )
}

function getPosition(elem: HTMLElement | null) {
    let xPos = 0;
    let yPos = 0;
    let el = elem;

    while (el) {
        if (el.tagName.toLowerCase() === "body") {
            // deal with browser quirks with body/window/document and page scroll
            const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            const yScroll = el.scrollTop || document.documentElement.scrollTop;

            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        } else {
            // for all other non-BODY elements
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }

        el = el.offsetParent as HTMLElement;
    }
    return {
        x: xPos,
        y: yPos
    };
}