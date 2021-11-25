import "./style.scss"
import {useKeycloak} from "@react-keycloak/web";
import YachtScreenshot from "../../rsc/Landingshot.png"
import {JoinButton} from "../joinButton";
import {Links} from "../joinButton/links";
import Yacht from "../../rsc/yacht.mp4"
import {Parallax} from "react-scroll-parallax";

export function Landing() {
    const {keycloak} = useKeycloak()
    return (
        <div id={"landing"}>
            <div id={"intro"}>
                <div className={"contentWrapper"}>
                    <Parallax className={"screenshot"} y={[-20, 20]}>
                        <img className={"demo light"} src={YachtScreenshot} alt={"Yacht Screenshot"}/>
                        <video className={"demo dark"} autoPlay loop muted>
                            <source src={Yacht} type={"video/mp4"}/>
                        </video>
                    </Parallax>
                    <div className={"content"}>

                        <div className={"background"}/>

                        <div className={"introText"}>
                            <div className={"headings"}>
                                <h2>Bring your team home.</h2>
                                <h2 className={"subheading"}>With the future of communication.</h2>
                            </div>

                            <JoinButton/>

                            <br/>

                            <Links/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
