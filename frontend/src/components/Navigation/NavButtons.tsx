import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";
import {Link} from "react-router-dom"
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";

interface Props {
    closeButton?: boolean
    logout: () => void

}

export function NavButtons(props: Props) {

    return (
        <nav className={"nav-items"} onClick={props.logout}>
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

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => dispatch(sendLogout()),
})

export default connect(undefined, mapDispatchToProps)(NavButtons)