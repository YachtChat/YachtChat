import {IoCafeOutline, IoEaselOutline, IoLaptopOutline, IoManOutline, IoPeopleOutline} from "react-icons/io5";
import React, {ReactElement} from "react";
import collaboration from "../rsc/collaboration.jpg"
import virtualhq from "../rsc/virtualhq.jpg"
import newemployee from "../rsc/newemployee.jpg"
import coffee from "../rsc/coffee.jpg"
import workshop from "../rsc/workshop.jpg"
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
        { // Tristan
            name: "Coffee break sessions",
            image: coffee,
            text: [
                "When working remotely some of the more informal exchanges get lost. " +
                "Meetings are often more official and scheduled. " +
                "Additionally, when using traditional video conferencing tools only one person at a time can talk. " +
                applicationName + " promotes dynamic exchange - spontaneously bump into anyone in a space and talk to them. " +
                "Just like in a hallway or coffee kitchen."
            ],
            icon: <IoCafeOutline/>
        },
        { //  Seba
            name: "Virtual HQ",
            image: virtualhq,
            text: [
                "Bring the whole team home. " +
                applicationName + " creates an office atmosphere and accompanies you and your team during your day. " +
                "Enter " + applicationName + " at the beginning of your working day, have spontaneous conversations, approach each other and finally collaborate like in the office again."
            ],
            icon: <IoLaptopOutline/>
        },
        { // Tristan
            name: "Collaborative Sessions",
            image: collaboration,
            text: [
                "No matter if you work on a project together or just a specific task that needs consultation – " + applicationName + " will provide you with the necessary tools to shape a productive and creative working environment. " +
                "Speak to each other when you need to work on something simultaneously or split up into subgroups when you need to focus on a task by yourself and find back as soon as you need to."
            ],
            icon: <IoPeopleOutline/>
        },
        { // Seba
            name: "New employee",
            image: newemployee,
            text: [
                "Integrating new employees into the team is a challenge - especially for remote working teams. " +
                applicationName + " helps you with this task by creating a space and atmosphere where spontaneous conversations and discussions are encouraged. " +
                "Short questions can be easily answered without setting up a new call. " +
                "This makes getting to know each other easier and more personal. " +
                "With " + applicationName + " new hires will feel right as part of the team."
            ],
            icon: <IoManOutline/>
        },
        { // Tristan
            name: "Workshops",
            image: workshop,
            text: [
                "Due to the unique capabilty of dynamically adapting your speaking range, different members can model their role in a space. " +
                "When a person presents something the speaking range can be maximized to reach a big number of people, " +
                "and minimized when having a private question or discussion about the presentation content. " +
                "Workgroups can be formed in productivity phases and easily merge back together when presenting something."
            ],
            icon: <IoEaselOutline/>
        }
    ]
}
