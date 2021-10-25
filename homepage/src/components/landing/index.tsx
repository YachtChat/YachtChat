import "./style.scss"
import Film from "../../rsc/Film.m4v"
import Yacht from "../../rsc/yacht_font.png"
import {IoArrowForward, IoLogoInstagram, IoLogoLinkedin, IoLogoTiktok} from "react-icons/all";
import {useKeycloak} from "@react-keycloak/web";
import {FRONTEND_URL, INSTA, LINKEDIN, TIKTOK} from "../../util/config";

export function Landing() {
    const {keycloak} = useKeycloak()
    return (
        <div id={"landing"}>
            <video autoPlay playsInline muted loop id="video">
                <source src={Film} type="video/mp4"/>
            </video>

            <div id={"intro"}>
                <div className={"background"}></div>
                <div className={"content"}>

                    <img alt={"yacht.chat"} src={Yacht}/>
                    <div className={"headings"}>
                        <h2>Bring your team home.</h2>
                        <h2 className={"subheading"}>With the future of communication.</h2>
                    </div>

                    <div className={"button"}
                         onClick={() => keycloak.login({redirectUri: "https://" + FRONTEND_URL})}>Join a new way of
                        working <IoArrowForward/></div>

                    <br/>

                    <div className={"links"}>
                        <a href={INSTA}><IoLogoInstagram/></a>
                        <a href={LINKEDIN}><IoLogoLinkedin/></a>
                        <a href={TIKTOK}><IoLogoTiktok/></a>
                    </div>
                </div>
            </div>
        </div>
    )
}
