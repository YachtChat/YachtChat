import React, {Component} from "react";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {submitRadius} from "../../store/userSlice";
import './style.scss';


interface Props {
    activeUser: User
    changeRadius: (range: number) => void
}


export class RangeSlider extends Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    handleChangeRange(event: any) {
        this.props.changeRadius(event.target.value)
    }

    render() {
        return (
            <div className="slider-parent">
                <input type="range" className="range-slider" min={0.1} max={1}
                       step={0.1} value={this.props.activeUser.position.range}
                       onChange={this.handleChangeRange.bind(this)}/>
                <div className="range-value">
                    Range: {this.props.activeUser.position.range * 100}%
                </div>
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

export default connect(mapStateToProps,  mapDispatchToProps)(RangeSlider)