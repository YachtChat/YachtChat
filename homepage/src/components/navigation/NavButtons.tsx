import {IoClose} from "react-icons/all";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {
    return (
        <nav className={"nav-items"}>
            {!!props.closeButton &&
            <a className={"close-button"}><IoClose/></a>
            }
            <a>Home</a>
            <a>About</a>
            <a>How To</a>
            <a>Szenarios</a>
            <a>Contact</a>
        </nav>
    )
}