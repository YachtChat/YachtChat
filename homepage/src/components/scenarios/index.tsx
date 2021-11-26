import React, {useState} from "react";
import "./style.scss";
import {getSzenarios} from "../../util/szenarios";
import {ScenarioNavigation} from "./scenarioNavigation";
import {useSwipeable} from "react-swipeable";
import {Scenario} from "./scenario";
import {applicationName} from "../../util/config";

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
            <div {...handlers} className="contentWrapper">
                <h1>{applicationName} will help every day</h1>
                <h2 className={"subtitle"}>
                    See some examples where
                    <br/>{applicationName} provides great value.</h2>
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