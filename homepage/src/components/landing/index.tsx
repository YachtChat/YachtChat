import "./style.scss"
import Film from "../../rsc/Film.m4v"
import Yacht from "../../rsc/yacht_font.png"
import Yacht_Dark from "../../rsc/yacht_font_white.png"
import {IoArrowForward, IoLogoInstagram, IoLogoLinkedin, IoLogoTiktok} from "react-icons/all";
import {useKeycloak} from "@react-keycloak/web";
import {FRONTEND_URL, INSTA, LINKEDIN, TIKTOK} from "../../util/config";

export function Landing() {
    const {keycloak} = useKeycloak()
    return (
        <div id={"landing"}>
            <div className={"video-wrapper"}>

                <video autoPlay playsInline muted loop id="video">
                    <source src={Film} type="video/mp4"/>
                </video>
            </div>

            <div id={"intro"}>
                <div className={"contentWrapper"}>
                    <div className={"background"}/>

                    <div className={"content"}>

                        <img className={"light"} alt={"yacht.chat"} src={Yacht}/>
                        <img className={"dark"} alt={"yacht.chat"} src={Yacht_Dark}/>
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
        </div>
    )
}
