import React from 'react';
import classNames from "classnames";
import {ClickEvent} from "./index";
import {ScenarioData} from "../../util/szenarios";

interface Props {
    scenario: ScenarioData;
    open: boolean;
    active: boolean;
    onClick: (event: ClickEvent) => (() => void);
}

export function Scenario(props: Props) {

    const scenarioCN = classNames({
        scenario: true,
        open: props.open,
        closed: !props.open,
        active: props.active,
        inactive: !props.active,
    });

    const backgroundImg = {
        backgroundImage: (props.scenario.image) ? `url(${props.scenario.image})` : "transparent",
    }

    return (
        <div className={scenarioCN} onClick={props.onClick("click")}>
            <div className="backgroundImg" style={backgroundImg}/>
            <div className="titleSheet">
                <h2>{props.scenario.icon}</h2>
                <h2>{props.scenario.name}</h2>
                {props.scenario.text.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}

            </div>
        </div>
    )
}