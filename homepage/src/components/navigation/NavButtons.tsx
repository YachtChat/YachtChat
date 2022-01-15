import {IoClose} from "react-icons/all";
import {useEffect, useState} from "react";
import {SUPPORT} from "../../util/config";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})

    const [curEl, setCurEl] = useState<string>("")

    const elids = ["landing", "about", "usp", "tutorial", "contact"]
    const names = ["Home", "About", "Features", "How To", "Contact"]

    const updateActiveElement = () => {
        const els = elids.map(el => Math.abs(getPosition(document.getElementById(el)).y))
        const index = els.indexOf(Math.min(...els));
        setCurEl(elids[index])
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
            <a className={""} href={SUPPORT}>Help</a>

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