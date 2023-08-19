import React from "react";
import {IoArrowForward} from "react-icons/io5";
import "./style.scss";

interface Props {
    className?: string;
}

export function JoinButton(props: Props) {
    return (
        <div onClick={() =>  document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})} className={props.className + " joinButton"}>
            Get free demo <IoArrowForward/>
        </div>
    )
}