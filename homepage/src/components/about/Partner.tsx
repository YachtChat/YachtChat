import HI from "../../rsc/partner/Hessen_Ideen_Logo_blanko.png"
import UI from "../../rsc/partner/UI_Logo_RGB.png"
import VL_dark from "../../rsc/partner/Logo circle.png"
import VL_white from "../../rsc/partner/Logo circle_white.png"
import highest from "../../rsc/partner/HIGHEST_EinZeiler.jpg"
import {applicationName} from "../../util/config";

export function Partner() {
    return (
        <div className={"partners"}>
            <h1>Customers & partners</h1>
            <h2 className={"subtitle"}>See some those who use and support {applicationName}</h2>
            <div className={"partnerWrapper"}>
                <div className={"partner"}>
                    <a href={"https://hessen-ideen.de/ideen/alumni/detailansicht/279/Yacht/show/Projekte/1/0/?cHash=7296b454ac4e3698c7c3355f27d96110"}>
                        <img alt={"Hessen Ideen Förderung"} src={HI}/>
                    </a>
                    <a href={"https://venture-lab.de/blog/yacht-chat/"}>
                        <img className={"light"} alt={"Venture Lab"} src={VL_dark}/>
                        <img className={"dark"} alt={"Venture Lab"} src={VL_white}/>
                    </a>
                    <a href={"https://www.tu-darmstadt.de/wissenstransfer/gruendungszentrum_highest/index.de.jsp"}>
                        <img alt={"HIGHEST Innovations- und Gründungszentrum"} src={highest}/>
                    </a>
                    <a href={"https://www.union-investment.de/"}>
                        <img alt={"Union Investment"} src={UI}/>
                    </a>
                </div>
            </div>
        </div>
    )
}