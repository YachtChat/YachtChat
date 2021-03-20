import React, {Component} from "react";
import {User} from "../../store/models";
import {getStream} from "../../store/connectionSlice";
import {RootState} from "../../store/store";
import {getUsers} from "../../store/userSlice";
import {connect} from "react-redux";
import {Playground} from "./index";

interface Props {
    user: User
    onMouseDown?: (e: React.MouseEvent) => void
    sizeMultiplier: number
}

export class UserComponent extends Component<Props> {
    private myRef: React.RefObject<HTMLVideoElement>;


    constructor(props: Props) {
        super(props);

        this.myRef = React.createRef();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.user.userStream && this.myRef.current && !this.myRef.current.srcObject) {
            this.myRef.current.srcObject = getStream(this.props.user.id)
        }
    }

    render() {
        if (this.props.user.name === null)
            return (<div/>);
        const user = this.props.user
        const userSize = 100 * this.props.sizeMultiplier
        const x = user.position.x * this.props.sizeMultiplier
        const y = user.position.y * this.props.sizeMultiplier

        const userStyle = {
            width: userSize,
            height: userSize,
            left: x - userSize / 2,
            top: y - userSize / 2
        }
        // range in pixels
        const maxRange = 300
        const rangeInPx = 2 * maxRange * user.position.range * this.props.sizeMultiplier + userSize

        const rangeStyle = {
            width: rangeInPx,
            height: rangeInPx,
            left: x - rangeInPx / 2,
            top: y - rangeInPx / 2
        }

        return (
            <div className={(!!this.props.onMouseDown) ? "activeUser" : ""}>
                <div className={"userRange"} style={rangeStyle}/>
                <div className="User" style={userStyle}
                     onMouseDown={(!!this.props.onMouseDown) ? this.props.onMouseDown : () => {
                     }}>
                    {user.name}
                    {!!this.props.user.userStream &&
                    <video autoPlay muted={!!this.props.onMouseDown} ref={this.myRef}/>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    sizeMultiplier: state.userState.scalingFactor
})

export default connect(mapStateToProps)(UserComponent)