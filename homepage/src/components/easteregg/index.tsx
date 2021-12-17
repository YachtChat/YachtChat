import React, {useEffect, useState} from "react";
import "./style.scss";
import christmasyacht from "../../rsc/christmasyacht.png";
import {EasterEggFound} from "./easteregg";


interface Props {
    image?: string
    expiry?: string
}


export function EasterEgg(props: Props) {

    const [click, setClick] = useState(false);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const current = new Date();
        const expiry = new Date(props.expiry ?? "")

        if (current.getTime() < expiry.getTime() || !props.expiry) {
            setShowEasterEgg(true)
            console.log(current.getTime(), expiry.getTime())
        } else {
            setShowEasterEgg(false)
        }
    }, []);

    return (
        <div className={"EasterEgg"}>
            <EasterEggFound visible={click} onClick={() => setClick(false)}/>
            {showEasterEgg &&
                <img className={"christmasyacht"} src={props.image ?? christmasyacht} alt={"Easter Egg"}
                     onClick={() => setClick(true)}/>
            }
        </div>
    )
}