import {IoCafeOutline, IoEaselOutline, IoLaptopOutline, IoManOutline, IoPeopleOutline} from "react-icons/all";
import {ReactElement} from "react";
import collaboration from "../rsc/collaboration.jpg"
import virtualhq from "../rsc/virtualhq.jpg"
import newemployee from "../rsc/newemployee.jpg"
import {applicationName} from "./config";

export interface ScenarioData {
    name: string
    text: string[]
    movie?: string
    image?: string
    icon?: ReactElement
}

export const getSzenarios = (): ScenarioData[] => {
    return [
        {
            name: "Coffee break sessions",
            image: collaboration,
            text: [
                ""
            ],
            icon: <IoCafeOutline/>
        },
        {
            name: "Virtual HQ",
            image: virtualhq,
            text: [
                "The whole team at home." + applicationName + "creates an office atmosphere and accompanies you and your team during the working day. The whole team at home. Yacht creates an office atmosphere and accompanies you and your team during the working day. Enter" + applicationName + "at the beginning of your working day, have spontaneous conversations, approach each other and finally collaborate like in the office again."
            ],
            icon: <IoLaptopOutline/>
        },
        {
            name: "Collaborative Sessions",
            image: collaboration,
            text: [
                "No matter if work on a project together or just a specific task that needs consultation – " + applicationName + " will provide you with the necessary tools to shape a productive and creative working environment. Speak to each other when you need to work on something simultaneously or split up into subgroups when you need to focus on a task by yourself and find back as soon as you need to."
            ],
            icon: <IoPeopleOutline/>
        },
        {
            name: "New employee",
            image: newemployee,
            text: [
                "Integrating new employees into the team is a challenge - especially for remote working teams." + applicationName + "helps you with this task by creating a space and atmosphere where spontaneous conversations and discussions are encouraged. This makes getting to know each other easier and more personal."
            ],
            icon: <IoManOutline/>
        },
        {
            name: "Workshops",
            image: newemployee,
            text: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis metus vulputate enim pretium bibendum. Nulla erat neque, aliquet et turpis ac, placerat gravida nulla. Aliquam tempus, nisl vitae sollicitudin finibus, leo mi tincidunt leo, in pharetra leo ex sed tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi imperdiet diam id felis auctor ornare. Vivamus metus augue, blandit in maximus vitae, rhoncus id magna. Aliquam id tempus ipsum. Ut sollicitudin nulla nec eros vehicula, sed tempus enim venenatis."
            ],
            icon: <IoEaselOutline/>
        }
    ]
}
