import React, {Component} from "react";
import {connect} from "react-redux";
import './style.scss';
import NavigationBar from "../NavigationBar";
import {handleZoom} from "../../store/playgroundSlice";
import Canvas from "./Canvas";
import Wrapper from "../Wrapper";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {requestSpaces} from "../../store/spaceSlice";
import {loadAllMediaDevices, requestUserMediaAndJoin} from "../../store/rtcSlice";

interface Props {
    activeUser: User
    handleZoom: (zoom: number) => void
    match?: {
        params: {
            spaceID: string
        }
    }
    requestUserMedia: (spaceID: string) => void
    loadMediaDevices: () => void
    userMedia: boolean
    cameras: string[]
    microphones: string[]
    joinedSpace: boolean
}

export class Playground extends Component<Props> {

    componentDidMount() {
        this.props.loadMediaDevices()
        if (this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
            this.props.requestUserMedia(this.props.match!.params.spaceID)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        // console.log("TESTTSTST", this.props.joinedSpace)
        // if (!this.props.joinedSpace) {
        //         console.log("WAS IST DAS DENN HIER", (!this.props.joinedSpace && prevProps.joinedSpace !== !this.props.joinedSpace))
        //      this.props.requestUserMedia(this.props.match!.params.spaceID)
        // }
    }

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
        if (this.props.cameras.length === 0 && this.props.microphones.length === 0)
            return (
                <Wrapper className="spaces">
                    <h1>Hey, {this.props.activeUser.name}.</h1>
                    <p>AlphaBibber Chat is a video chatting app. So please click and confirm video to continue.</p>
                    <button onClick={() => {
                        this.props.requestUserMedia(this.props.match!.params.spaceID)
                    }}>Request media
                    </button>
                </Wrapper>
            )


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


const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaces: state.space.spaces,
    microphones: state.rtc.microphones,
    cameras: state.rtc.cameras,
    userMedia: state.rtc.userMedia,
    joinedSpace: state.webSocket.joinedRoom
})

const mapDispatchToProps = (dispatch: any) => ({
    handleZoom: (z: number) => dispatch(handleZoom(z)),
    requestSpaces: () => dispatch(requestSpaces()),
    requestUserMedia: (spaceID: string) => dispatch(requestUserMediaAndJoin(spaceID)),
    loadMediaDevices: () => dispatch(loadAllMediaDevices())
})

export default connect(mapStateToProps, mapDispatchToProps)(Playground)