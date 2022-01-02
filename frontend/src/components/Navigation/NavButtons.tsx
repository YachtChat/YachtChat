import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";
import {Link} from "react-router-dom"
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";

interface Props {
    closeButton?: boolean
    logout: () => void
    active?: string
}

export function NavButtons(props: Props) {

    return (
        <nav className={"nav-items"} onClick={props.logout}>
            <Link to={"/spaces"}>
                <button className={(props.active === "spaces") ? "active" : ""}>
                    <IoChatbubblesOutline />
                    <br />
                    Spaces
                </button>
            </Link>
            <Link to={"/create-space"}>
            <button className={(props.active === "create-space") ? "active" : ""}>
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
            <Link to={"/settings/"}>
                <button className={(props.active === "settings") ? "active" : ""}>
                    <IoCogOutline />
                    <br/>
                    Settings
                </button>
            </Link>

        </nav>
    )
}

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => dispatch(sendLogout(false)),
})

export default connect(undefined, mapDispatchToProps)(NavButtons)