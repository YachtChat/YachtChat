import {IoAddOutline, IoChatbubblesOutline, IoCogOutline, IoPeopleOutline} from "react-icons/io5";
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";
import {applicationName, SUPPORT_URL} from "../../store/utils/config";
import {push} from "redux-first-history";

interface OwnProps {
    spaceID?: string
    closeButton?: boolean
    active?: string
}

interface OtherProps {
    logout: (s: string) => void
}

type Props = OwnProps & OtherProps

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

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    logout: (s: string) => {
        if (!ownProps.spaceID || window.confirm("Are you sure to leave this space").valueOf()) {
            document.title = applicationName
            dispatch(sendLogout(false))
            dispatch(push(s))
        }
    },
})

export default connect(undefined, mapDispatchToProps)(NavButtons)