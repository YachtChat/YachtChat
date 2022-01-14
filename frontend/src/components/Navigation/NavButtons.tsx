import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/all";
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";
import {SUPPORT_URL} from "../../store/config";
import {push} from "connected-react-router";

interface Props {
    closeButton?: boolean
    logout: (s: string) => void
    active?: string
}

export function NavButtons(props: Props) {

    return (
        <nav className={"nav-items"}>
            <button onClick={() => props.logout("/spaces/")}
                    className={(props.active === "spaces") ? "active" : ""}>
                <IoChatbubblesOutline/>
                <br/>
                Spaces
            </button>
            <button onClick={() => props.logout("/create-space")}
                    className={(props.active === "create-space") ? "active" : ""}>
                <IoAddOutline/>
                <br/>
                New Space
            </button>
            <a href={SUPPORT_URL}
               target="_blank" rel="noopener noreferrer"
            >
                <button>

                    <IoPeopleOutline/>
                    <br/>
                    Support
                </button>
            </a>
            <button onClick={() => props.logout("/settings")}
                    className={(props.active === "settings") ? "active" : ""}>
                <IoCogOutline/>
                <br/>
                Settings
            </button>

        </nav>
    )
}

const mapDispatchToProps = (dispatch: any) => ({
    logout: (s: string) => {
        if (window.confirm("Are you sure to leave this space").valueOf()) {
            dispatch(sendLogout(false))
            dispatch(push(s))
        }
    },
})

export default connect(undefined, mapDispatchToProps)(NavButtons)