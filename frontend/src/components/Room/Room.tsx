import React, {Component} from "react";
import "./style.scss"

interface Props {
    roomName: string
}

export class Room extends Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    //Room kennt seine User

    render() {
        return(
            <div className="box">
                <div>
                    {this.props.roomName}
                </div>
            </div>
        )
    }

}

export default (Room)