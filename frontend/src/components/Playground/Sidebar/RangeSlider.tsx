import React, {Component} from "react";
import {User} from "../../../store/model/model";
import {RootState} from "../../../store/utils/store";
import {connect} from "react-redux";
import {submitRadius} from "../../../store/userSlice";
import './style.scss';
import {Slider} from "@mui/material";


interface Props {
    activeUser: User
    changeRadius: (range: number) => void
    sendToPosthog: (event: string) => void
}

export class RangeSlider extends Component<Props> {

    handleChangeRange(event: any) {
        this.props.sendToPosthog("radius")
        this.props.changeRadius(event.target.value)
    }

    render() {
        return (
            <div className="slider-parent">
                <Slider
                    className={"slider"}
                    orientation="vertical"
                    color={"primary"}
                    value={(this.props.activeUser.position) ? this.props.activeUser.position.range : 30}
                    max={100}
                    min={20}
                    step={1}
                    track={false}
                    onChange={(e, n) => this.props.changeRadius(n as number)}
                    aria-labelledby="vertical-slider"
                />
            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    changeRadius: (range: number) => dispatch(submitRadius(range)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RangeSlider)