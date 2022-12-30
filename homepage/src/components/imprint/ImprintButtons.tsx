import {Link, NavLink} from "react-router-dom";
import {IoArrowBack} from "react-icons/io5";

export function ImprintButtons() {
    // https://www.termsofservicegenerator.net/download.php?lang=en&token=62I9LDi0smDCglshk2xgfLSqJG7b3qjH
    return (
        <div className={"buttons"}>
            <Link className={"button outlined"} to={"/"}><IoArrowBack /> back home</Link>
            <NavLink className={({isActive}) => isActive ? "button" : "button outlined"} to={"/imprint"}>Imprint</NavLink>
            <NavLink className={({isActive}) => isActive ? "button" : "button outlined"} to={"/privacy"}>Privacy policy</NavLink>
            <NavLink className={({isActive}) => isActive ? "button" : "button outlined"} to={"/terms"}>Terms & Conditions</NavLink>
        </div>
    )
}