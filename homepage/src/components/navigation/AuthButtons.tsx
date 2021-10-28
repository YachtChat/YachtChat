import {FRONTEND_URL} from "../../util/config";
import {IoArrowForward} from "react-icons/all";
import {useKeycloak} from "@react-keycloak/web";


export function AuthButtons() {

    const {keycloak} = useKeycloak()

    return (
        <div className={"authentification"}>
            {keycloak.authenticated ? (
                <div className={"buttons"}>
                    <a className={"button"} href={"https://" + FRONTEND_URL}>Go to Spaces <IoArrowForward/></a>
                </div>
            ) : (
                <div className={"buttons"}>
                    <button className={"button"}
                            onClick={() => keycloak.login({redirectUri: 'https://' + FRONTEND_URL})}>Login
                    </button>
                    <button className={"button solid"}
                            onClick={() => keycloak.register({redirectUri: 'https://' + FRONTEND_URL})}>Sign
                        Up
                    </button>
                </div>
            )}
        </div>
    )
}