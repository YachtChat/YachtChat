import React, {Component} from "react";
import "./style.scss"

interface Props {
    StatusName: string
}

export class Status extends Component<Props> {

    // constructor(props: Props) {
    //     super(props);
    // }

    //Status kennt seine User

    render() {
        return (
            <div className="box">
                <div>
                    {this.props.StatusName}
                </div>
            </div>
        )
    }

}

export default (Status)