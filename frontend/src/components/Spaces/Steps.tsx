import {Step, StepIconProps, StepLabel, Stepper} from "@material-ui/core";
import {IoCheckmark} from "react-icons/all";

interface Props {
    active: number
}

export function Steps(props: Props) {
    const steps = [
        "Create a space",
        "Invite users",
        "Join your space"
    ]

    return (
        <Stepper className={"stepper"} activeStep={props.active}>
            {steps.map((label) => (
                <Step color={"#326789"} key={label}>
                    <StepLabel StepIconComponent={ElTy} color={"#326789"}>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>
    )
}


function ElTy(props: StepIconProps) {
    return (
        <div className={"stepIcon " + ((props.active || props.completed) ? "active" : "")}>
            {props.completed ? <IoCheckmark /> : props.icon}
        </div>)
}