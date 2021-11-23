import {FRONTEND_URL} from "../../util/config";
import {IoArrowForward} from "react-icons/all";
import {auth} from "../../util/keycloak";
import "./style.scss";

interface Props {
    className?: string;
}

export function JoinButton(props: Props) {
    const keycloak = auth
    return (
        <div className={props.className + " joinButton"}
             onClick={() => keycloak.login({redirectUri: "https://" + FRONTEND_URL})}>
            Get started for free <IoArrowForward/>
        </div>
    )
}