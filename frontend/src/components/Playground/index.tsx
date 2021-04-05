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
import {setSessionEnded} from "../../store/connectionSlice";
import {Link, Redirect} from "react-router-dom";
import {IoCamera, IoHome, IoMic} from "react-icons/all";
import {applicationName} from "../../store/config";

interface Props {
    activeUser: User
    handleZoom: (zoom: number) => void
    match?: {
        params: {
            spaceID: string
        }
    }
    requestUserMedia: (spaceID: string) => void
    loadMediaDevices: (callback?: () => void) => void
    startSession: () => void
    userMedia: boolean
    cameras: string[]
    microphones: string[]
    joinedSpace: boolean
    sessionEnded: boolean
}

export class Playground extends Component<Props> {

    componentDidMount() {
        this.props.startSession()
        this.props.loadMediaDevices(() => {
            console.log(this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
            if (this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
                this.props.requestUserMedia(this.props.match!.params.spaceID)
        })
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
                <Wrapper className={"mediaPermission"}>
                    <div className={"headlineBox"}>
                        <div className={"buttons"}>
                            <Link to={"/"}>
                                <button className={"iconButton"}><IoHome/></button>
                            </Link>
                        </div>
                        <h1><IoCamera/> <IoMic/></h1>
                        <h1>Hey, {this.props.activeUser.name}</h1>
                        <p>
                            {applicationName} is a video chatting app.<br/>So please click and confirm video to
                            continue.
                        </p>
                    </div>
                    <div className={"content"}>
                        <button onClick={() => {
                            this.props.requestUserMedia(this.props.match!.params.spaceID)
                        }}>Request media
                        </button>
                    </div>
                </Wrapper>
            )

        if (this.props.sessionEnded)
            return <Redirect to={"/spaces"}/>

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
    joinedSpace: state.webSocket.joinedRoom,
    sessionEnded: state.webSocket.sessionEnded
})

const mapDispatchToProps = (dispatch: any) => ({
    handleZoom: (z: number) => dispatch(handleZoom(z)),
    requestSpaces: () => dispatch(requestSpaces()),
    requestUserMedia: (spaceID: string) => dispatch(requestUserMediaAndJoin(spaceID)),
    loadMediaDevices: (callback?: () => void) => dispatch(loadAllMediaDevices(callback)),
    startSession: () => dispatch(setSessionEnded(false))
})

export default connect(mapStateToProps, mapDispatchToProps)(Playground)