import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";
import {Link} from "react-router-dom"

interface Props {
    closeButton?: boolean
}

export function NavButtons(props: Props) {
    return (
        <nav className={"nav-items"}>
            <Link to={"/spaces"}>
                <button>
                    <IoChatbubblesOutline />
                    <br />
                    Spaces
                </button>
            </Link>
            <Link to={"/create-space"}>
            <button>
                <IoAddOutline />
                <br />
                New Space
            </button>
            </Link>
            <button>
                <IoPeopleOutline />
                <br />
                Support
            </button>
            <Link to={"/settings"}>
                <button>
                    <IoCogOutline />
                    <br/>
                    Settings
                </button>
            </Link>

        </nav>
    )
}