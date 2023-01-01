import React from "react";
import Yacht from "../../rsc/yacht_font.png";
import Yacht_Dark from "../../rsc/yacht_font_white.png";
import {Link} from "react-router-dom";

export function Logo() {

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})

    return (
        <Link to={"/"}>
            <div className={"logo"}>
                <svg onClick={() => scrollTo("landing")} className={"logo-pic"} width="100%" height="100%"
                     viewBox="0 0 2796 2796"
                     style={{
                         fillRule: "evenodd",
                         clipRule: "evenodd",
                         strokeLinecap: "round",
                         strokeLinejoin: "round",
                         //strokeMiterlimit: "1.5"
                     }}>

                    <g transform="matrix(1,0,0,1,-355,-196)">
                        <g id="V6_light" transform="matrix(1,0,0,1,513.78,0)">
                            <g>
                                <g clip-path="url(#_clip1)">
                                    <g transform="matrix(0.991708,-0.128509,0.128509,0.991708,-228.102,262.043)">
                                        <path d="M1065,1439L1065,935L1649,945L1637,1338L1146,1340L1065,1439Z" style={{
                                            fill: "white",
                                            stroke: "white",
                                            strokeWidth: "33.33px"
                                        }}/>
                                    </g>
                                    <g transform="matrix(1,0,0,1,20,139.959)">
                                        <path
                                            d="M2040,1361L555,1548L464,1735C464,1735 768.539,1592.36 1186.37,1784.98C1264.35,1820.93 1412.76,1896.18 1483.89,1923.31C1550.64,1948.76 1550.32,1942 1550.32,1942C1550.32,1942 1731.41,1881.4 1868.23,1746.98C2007.81,1609.85 2040,1361 2040,1361Z"
                                            style={{
                                                fill: "white",
                                                stroke: "white",
                                                strokeWidth: "33.33px"
                                            }}/>
                                    </g>
                                    <path
                                        d="M193.867,2099.37C193.867,2099.37 397.602,1886.93 782.157,1886.94C1166.71,1886.95 1416.36,2162.01 1678.31,2162C2028.41,2161.98 2169.09,2016.09 2362.66,1889.94C2385.1,1875.31 2144.3,2770.21 1172.16,2755C504.824,2744.56 193.867,2099.37 193.867,2099.37Z"
                                        style={{
                                            fill: "rgb(185, 194, 208)"
                                        }}/>
                                </g>
                            </g>
                            <g transform="matrix(1.18595,0,0,1.18489,-514.453,-477.544)">
                                <circle cx="1479.5" cy="1744.5" r="946.5" style={{
                                    fill: "none",
                                    stroke: "white",
                                    strokeWidth: "56.24px"
                                }}/>
                            </g>
                        </g>
                    </g>
                </svg>
                <img className={"logo-text light"} alt={"yacht.chat"} src={Yacht}/>
                <img className={"logo-text dark"} alt={"yacht.chat"} src={Yacht_Dark}/>
            </div>
        </Link>
    )
}