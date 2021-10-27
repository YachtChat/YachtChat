import React, {useState} from "react";
import "./style.scss";
import {getSzenarios} from "../../util/szenarios";
import {ScenarioNavigation} from "./scenarioNavigation";
import {useSwipeable} from "react-swipeable";
import {Scenario} from "./scenario";

interface Props {
}

export type ClickEvent = "open" | "close" | "click";

export function Scenarios(props: Props) {

    const scenarios = getSzenarios();
    const [openElement, setOpenElement] = useState(-1)
    const [activeElement, setActiveElement] = useState(Math.round(scenarios.length / 2) - 1)

    function handleOpenEvent(i: number, open: boolean) {
        setOpenElement((open) ? i : -1)
    }

    function handleClickEvent(e: ClickEvent, i: number) {
        if (activeElement !== i) {
            return () => {
                setOpenElement(-1)
                setActiveElement(i)
            };
        }

        switch (e) {
            case "open":
                return () => handleOpenEvent(i, true);
            case "close":
                return () => handleOpenEvent(i, false);
            case "click":
                return () => {
                };
        }
    }

    function handleSwipeEvent(direction: "left" | "right") {
        const max = getSzenarios().length - 1;
        const active = activeElement;
        switch (direction) {
            case "left":
                setOpenElement(-1)
                setActiveElement((active === max) ? 0 : active + 1)
                break;
            case "right":
                setOpenElement(-1)
                setActiveElement((active !== 0) ? active - 1 : max)
                break;
        }
    }

    const wrapperTransform = {
        'transform': `translateX(-${activeElement * (100 / scenarios.length)}%)`
    }

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipeEvent("left"),
        onSwipedRight: () => handleSwipeEvent("right")
    })

    return (
        <div className="scenarios" id="scenarios">
            <div className={"backgroundBall"}/>
            <svg className={"separator"} width="100%" height="100%" viewBox="0 0 1181 178" version="1.1"
                 style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
                <g transform="matrix(0.268213,0,0,0.268213,546.275,557.46)">
                    <circle cx="168" cy="2233" r="4256" style={{fill: "white"}}/>
                </g>
            </svg>
            <div {...handlers} className="contentWrapper">
                <h1>Scenarios</h1>
                <h2 className={"subtitle"}>See some examples where<br/>Yacht.Chat provides <i>most</i> value.</h2>
                <div className="scenarioWindow">
                    <div className="scenarioWrapper" style={wrapperTransform}>
                        {scenarios.map((project, i) => (
                            <Scenario scenario={project} open={i === openElement} onClick={
                                (event: ClickEvent) => handleClickEvent(event, i)} active={i === activeElement}
                                      key={i}/>
                        ))}
                    </div>
                </div>

                <ScenarioNavigation scenarios={scenarios} active={activeElement}
                                    onClick={handleClickEvent}/>
            </div>
        </div>);
}