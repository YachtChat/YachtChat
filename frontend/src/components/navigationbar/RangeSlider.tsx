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

interface State {
    value: number
}


export class RangeSlider extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            value: this.props.activeUser.position.range
        }
    }

    handleChangeRange(event: any) {
        this.setState({value: event.target.value})
        this.props.changeRadius(event.target.value)
    }

    render() {
        return (
            <div className="slider-parent">
                <input type="range" className="range-slider" min={10} max={100}
                       step={10} value={this.state.value} onChange={this.handleChangeRange.bind(this)}/>
                <div className="range-value">
                    Range: {this.state.value}
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