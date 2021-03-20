import React, {Component} from "react";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {submitRadius} from "../../store/userSlice";
import {connect} from "react-redux";
import "./style.scss"


interface Props {
    activeUser: User
    changeRadius: (range: number) => void
}

interface State {
    height: number
    width: number
    max: {clientHeight: number, clientWidth: number}
    current: {clientHeight: number, clientWidth: number}
}

export class Zoom extends Component<Props, State> {

    constructor(props: Props){
        super(props)

        // Initializing states
        this.state = {
            height: 100,
            width: 100,
            max: {clientHeight: window.innerHeight, clientWidth: window.innerWidth},
            current: {clientHeight: window.innerHeight / 3, clientWidth: window.innerWidth / 3}
        }

        // Bind context of 'this'
        this.handleZoomIn = this.handleZoomIn.bind(this)
        this.handleZoomOut = this.handleZoomOut.bind(this)

    }

    componentDidMount(){
        // Saving initial dimention of image as class properties
        this.setState({
            height : this.state.current.clientHeight,
            width : this.state.current.clientWidth
        })
    }

    // Event handler callback for zoom in
    handleZoomIn(){
        if(this.state.height +30 <= this.state.max.clientHeight &&
            this.state.width +30 <= this.state.max.clientWidth) {
            // Increase dimension(Zooming)
            this.setState({
                height: this.state.height + 30,
                width: this.state.width + 30
            })
        }
    }

    // Event handler callback zoom out
    handleZoomOut(){

        // Decrease dimension(Outzooming)
        this.setState({
            height : this.state.height - 30,
            width : this.state.width - 30
        })
    }

    onWheel(event: any){
        if(event.deltaY < 0 || event.deltaX < 0) {
            this.handleZoomOut()
        }

        if(event.deltaY > 0 || event.deltaX > 0){
            this.handleZoomIn()
        }
    }

    render() {
        const imgStyle = { height : this.state.height, width: this.state.width}
        return (
            <div onWheel={this.onWheel.bind(this)}>
                {/* Assign reference to DOM element     */}
                <img style={imgStyle} src=
                    'https://media.geeksforgeeks.org/wp-content/uploads/20200923125643/download.png' alt='gfg' />
                <div className="btn">
                    <button onClick={this.handleZoomIn}>+</button>
                    <button onClick={this.handleZoomOut}>-</button>
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

export default connect(mapStateToProps,  mapDispatchToProps)(Zoom)
