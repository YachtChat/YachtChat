import {EMAIL, INSTA, LINKEDIN} from "../../util/config";
import {IoLogoInstagram, IoLogoLinkedin, IoMailOutline} from "react-icons/all";


export function Links() {
    return (
        <div className={"links"}>
            <a href={INSTA}><IoLogoInstagram/></a>
            <a href={LINKEDIN}><IoLogoLinkedin/></a>
            <a href={EMAIL}><IoMailOutline/></a>
        </div>

    )
}