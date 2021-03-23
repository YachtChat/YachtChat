import React, {Component} from "react";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {submitRadius} from "../../store/userSlice";
import './style.scss';
import {Slider} from "@material-ui/core";
import variables from "../../variables.module.scss";


interface Props {
    activeUser: User
    changeRadius: (range: number) => void
}

export class RangeSlider extends Component<Props> {

    handleChangeRange(event: any) {
        this.props.changeRadius(event.target.value)
    }

    componentDidMount() {
        console.log(variables)
    }

    render() {
        // @ts-ignore
        return (
            <div className="slider-parent">
                <Slider
                    className={"slider"}
                    orientation="vertical"
                    color={"primary"}

                    defaultValue={this.props.activeUser.position.range}
                    max={1}
                    min={0.1}
                    step={0.05}
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