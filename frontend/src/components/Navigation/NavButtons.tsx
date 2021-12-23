import {IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {
    return (
        <nav className={"nav-items"}>
            <button><IoChatbubblesOutline /> Spaces</button>
            <button><IoPeopleOutline /> Support</button>
            <button><IoCogOutline /> Settings</button>

        </nav>
    )
}