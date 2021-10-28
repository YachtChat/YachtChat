import {IoClose} from "react-icons/all";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})

    return (
        <nav className={"nav-items"}>
            {!!props.closeButton &&
            <a className={"close-button"}><IoClose/></a>
            }
            <a onClick={() => scrollTo("landing")}>Home</a>
            <a onClick={() => scrollTo("about")}>About</a>
            <a onClick={() => scrollTo("scenarios")}>Use cases</a>
            <a onClick={() => scrollTo("usp")}>Why Yacht</a>
            <a onClick={() => scrollTo("tutorial")}>How To</a>
            <a onClick={() => scrollTo("contact")}>Contact</a>
        </nav>
    )
}