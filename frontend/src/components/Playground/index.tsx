import React, {Component} from "react";
import {connect} from "react-redux";
import './style.scss';
import NavigationBar from "../NavigationBar/NavigationBar";
import {handleZoom} from "../../store/playgroundSlice";
import Canvas from "./Canvas";

interface Props {
    handleZoom: (zoom: number) => void
}

export class Playground extends Component<Props> {

    // function handleZoomIn increases the sizeMultiplier
    handleZoomIn() {
        //this.props.changeSizeMultiplier(this.props.offset.scale + 0.1)
        this.props.handleZoom(0.05)
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        //this.props.changeSizeMultiplier(this.props.offset.scale - 0.1)
        this.props.handleZoom(-0.05)
    }

    render() {
        return (
            <div className={"contentWrapper"}>
                <div className={"navwrapper"}>
                    <NavigationBar/>
                </div>
                <Canvas/>
                <div className="btn">
                    <button onClick={this.handleZoomIn.bind(this)}>+</button>
                    <button onClick={this.handleZoomOut.bind(this)}>-</button>
                </div>
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch: any) => ({
    handleZoom: (z: number) => dispatch(handleZoom(z)),
})


export default connect(undefined, mapDispatchToProps)(Playground)