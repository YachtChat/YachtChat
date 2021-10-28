import {IoPeopleOutline} from "react-icons/all";
import {ReactElement} from "react";
import collaboration from "../rsc/collaboration.jpg"

export interface ScenarioData {
    name: string
    text: string[]
    movie?: string
    image?: string
    icon?: ReactElement
}

export const getSzenarios = (): ScenarioData[] => {
    return [{
        name: "Virtual HQ",
        image: collaboration,
        text: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis metus vulputate enim pretium bibendum. Nulla erat neque, aliquet et turpis ac, placerat gravida nulla. Aliquam tempus, nisl vitae sollicitudin finibus, leo mi tincidunt leo, in pharetra leo ex sed tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi imperdiet diam id felis auctor ornare. Vivamus metus augue, blandit in maximus vitae, rhoncus id magna. Aliquam id tempus ipsum. Ut sollicitudin nulla nec eros vehicula, sed tempus enim venenatis."
        ],
        icon: <IoPeopleOutline/>
    },
        {
            name: "Collaborative Sessions",
            image: collaboration,
            text: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis metus vulputate enim pretium bibendum. Nulla erat neque, aliquet et turpis ac, placerat gravida nulla. Aliquam tempus, nisl vitae sollicitudin finibus, leo mi tincidunt leo, in pharetra leo ex sed tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi imperdiet diam id felis auctor ornare. Vivamus metus augue, blandit in maximus vitae, rhoncus id magna. Aliquam id tempus ipsum. Ut sollicitudin nulla nec eros vehicula, sed tempus enim venenatis."
            ],
            icon: <IoPeopleOutline/>
        },
        {
            name: "New employee",
            image: collaboration,
            text: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis metus vulputate enim pretium bibendum. Nulla erat neque, aliquet et turpis ac, placerat gravida nulla. Aliquam tempus, nisl vitae sollicitudin finibus, leo mi tincidunt leo, in pharetra leo ex sed tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi imperdiet diam id felis auctor ornare. Vivamus metus augue, blandit in maximus vitae, rhoncus id magna. Aliquam id tempus ipsum. Ut sollicitudin nulla nec eros vehicula, sed tempus enim venenatis."
            ],
            icon: <IoPeopleOutline/>
        }
    ]
}