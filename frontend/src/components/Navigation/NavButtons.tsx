import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {
    return (
        <nav className={"nav-items"}>
            <button>
                <IoChatbubblesOutline />
                <br />
                Spaces
            </button>
            <button>
                <IoAddOutline />
                <br />
                New Space
            </button>
            <button>
                <IoPeopleOutline />
                <br />
                Support
            </button>
            <button>
                <IoCogOutline />
                <br/>
                Settings
            </button>

        </nav>
    )
}