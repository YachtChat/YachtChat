import {IoLockClosed, IoMdClock} from "react-icons/all";
import React, {useEffect, useState} from "react";
import "./style.scss"
import {applicationName} from "../../util/config";
import classNames from "classnames";
import {Card} from "../card";
import {IoMdHeart} from "react-icons/io";
import {Separator} from "../separator";
import christmasyacht from "../../rsc/christmasyacht.png";
import {EasterEgg} from "../easteregg";

export function Usp() {

    const [click, setClick] = useState(false);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const current = new Date();
        const expiry = new Date("December 07, 2021 15:00:00")

        if (current.getTime() < expiry.getTime()) {
            setShowEasterEgg(true)
            console.log(current.getTime(), expiry.getTime())
        } else {
            setShowEasterEgg(false)
        }
    }, []);

    return (
        <div id={"usp"}>
            {/*<div className={"backgroundBall"}/>*/}
            <Separator/>
            <EasterEgg visible={click} onClick={() => setClick(false)}/>
            <div className={"contentWrapper"}>
                <h1>Just you and your Team</h1>
                <h2 className={"subtitle"}>This is why {applicationName} is so special</h2>

                <div className={classNames({"aboutCards": true})}>
                    <Card>
                        <IoMdHeart className={"heart"}/>
                        <label>Revives teamspirit</label>
                        <p>
                            With its unique way of communication, {applicationName} promotes spontaneous conversations
                            and questions.
                            The teamspirit will be on new levels - even when working remotely.
                        </p>
                    </Card>
                    <Card>
                        <IoLockClosed className={"lock"}/>
                        <label>Privacy at its core</label>
                        <p>
                            {applicationName} was built in Germany with privacy in mind and tries to make the user
                            experience as secure as possible.
                            Every media connection is encrypted and based on the peer-to-peer principle. We store as
                            little data as possible on our EU-located servers.
                        </p>
                    </Card>
                    <Card>
                        <IoMdClock className={"clock"}/>
                        <label>Saves time</label>
                        <p>
                            With {applicationName} you can simply talk to anybody in a room.
                            Don't waste time making appointments and writing messages with your teammates – just talk
                            to them.
                        </p>
                    </Card>
                    {/*<Card>*/}
                    {/*    <IoBrush/>*/}
                    {/*    <label>Easy to use and understand</label>*/}
                    {/*    <p>*/}
                    {/*        At {applicationName}, everything revolves around you. In order to provide you with the best*/}
                    {/*        possible experience, we rely on a minimalistic yet highly appealing design. This*/}
                    {/*        makes {applicationName} intuitive for everyone to use.*/}
                    {/*    </p>*/}
                    {/*</Card>*/}
                </div>
                {showEasterEgg &&
                <img className={"christmasyacht"} src={christmasyacht} alt={"The christmas yacht.chat"}
                     onClick={() => setClick(true)}/>
                }
            </div>
        </div>
    )

}
