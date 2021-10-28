import {IoClose} from "react-icons/all";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})

    return (
        <nav className={"nav-items"}>
            {!!props.closeButton &&
            <button className={"close-button"}><IoClose/></button>
            }
            <button onClick={() => scrollTo("landing")}>Home</button>
            <button onClick={() => scrollTo("about")}>About</button>
            <button onClick={() => scrollTo("scenarios")}>Use cases</button>
            <button onClick={() => scrollTo("usp")}>Why Yacht</button>
            <button onClick={() => scrollTo("tutorial")}>How To</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
    )
}