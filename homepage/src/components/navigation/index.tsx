import './style.scss'
import {useKeycloak} from "@react-keycloak/web";
import {Logo} from "./Logo";
import {FRONTEND_URL} from "../../util/config";
import {IoArrowForward} from "react-icons/all";

interface Props {

}


export const Navigation = (props: Props) => {

    const {keycloak} = useKeycloak()

    return (
        <header id={"navigation"}>
            <div id={"nav-content"}>
                <Logo/>
                <nav id={"nav-items"}>
                    <a>Home</a>
                    <a>About</a>
                    <a>How To</a>
                    <a>Szenarios</a>
                    <a>Contact</a>
                </nav>
                <div id={"authentification"}>
                    {keycloak.authenticated ? (
                        <div className={"buttons"}>
                            <a className={"button"} href={"https://" + FRONTEND_URL}>Go to Spaces <IoArrowForward/></a>
                        </div>
                    ) : (
                        <div className={"buttons"}>
                            <a className={"button"}
                               onClick={() => keycloak.login({redirectUri: 'https://' + FRONTEND_URL})}>Login</a>
                            <a className={"button solid"}
                               onClick={() => keycloak.register({redirectUri: 'https://' + FRONTEND_URL})}>Sign Up</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navigation
