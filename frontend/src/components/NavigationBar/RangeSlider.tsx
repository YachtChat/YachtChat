import React, {Component} from "react";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {submitRadius} from "../../store/userSlice";
import './style.scss';
import {Slider} from "@material-ui/core";


interface Props {
    activeUser: User
    changeRadius: (range: number) => void
}

export class RangeSlider extends Component<Props> {

    handleChangeRange(event: any) {
        this.props.changeRadius(event.target.value)
    }

    render() {
        return (
            <div className="slider-parent">
                <Slider
                    className={"slider"}
                    orientation="vertical"
                    color={"primary"}
                    value={this.props.activeUser.position?.range}
                    max={100}
                    min={10}
                    step={5}
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