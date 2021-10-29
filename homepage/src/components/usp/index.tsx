import {IoBrush, IoLockClosed, IoMdClock} from "react-icons/all";
import React from "react";
import "./style.scss"
import {applicationName} from "../../util/config";
import classNames from "classnames";
import {Card} from "../card";
import {IoMdHeart} from "react-icons/io";
import {Separator} from "../separator";

export function Usp() {
    return (
        <div id={"usp"}>
            {/*<div className={"backgroundBall"}/>*/}
            <Separator/>
            <div className={"contentWrapper"}>
                <h1>Why {applicationName}?</h1>
                <h2 className={"subtitle"}>What makes {applicationName} so special?</h2>

                <div className={classNames({"aboutCards": true})}>
                    <Card>
                        <IoMdHeart/>
                        <label>Revives teamspirit</label>
                        <p>
                            With its unique way of communication, {applicationName} promotes spontaneous conversations
                            and questions.
                            The teamspirit will be on new levels - even when working remote.
                        </p>
                    </Card>
                    <Card>
                        <IoMdClock/>
                        <label>Saves time</label>
                        <p>
                            With {applicationName} you can simply talk to anybody in a room.
                            Don't waste time making appointments and writing messages with your teammates and just talk
                            to them.
                        </p>
                    </Card>
                    <Card>
                        <IoBrush/>
                        <label>Easy to use and understand</label>
                        <p>
                            At {applicationName}, everything revolves around our customers. In order to provide you with the best possible experience, we rely on a minimalistic yet highly appealing design. This makes {applicationName} intuitive for everyone to use.
                        </p>
                    </Card>
                    <Card>
                        <IoLockClosed/>
                        <label>Privacy at its core</label>
                        <p>
                            {applicationName} is a solution build in germany with privacy in mind from the beginning.
                            Every media connection is encrypted and based on the peer-to-peer principle and we store as
                            little data as
                            possible on our servers.
                        </p>
                    </Card>
                </div>

            </div>
        </div>
    )

}
