import React, {Component} from "react";
import {connect} from "react-redux";
import './style.scss';
import Sidebar from "./Sidebar";
import {handleZoom, initPlayground} from "../../store/playgroundSlice";
import Canvas from "./Canvas";
import Wrapper, {Loading} from "../Wrapper";
import {Space, User} from "../../store/models";
import {RootState} from "../../store/store";
import {requestSpaces} from "../../store/spaceSlice";
import {loadAllMediaDevices, requestUserMediaAndJoin} from "../../store/rtcSlice";
import {Link} from "react-router-dom";
import {IoCamera, IoHome, IoMic} from "react-icons/all";
import {applicationName} from "../../store/config";
import {sendLogout} from "../../store/webSocketSlice";
import Navigation from "../Navigation";

interface Props {
    activeUser: User
    handleZoom: (zoom: number) => void
    match?: {
        params: {
            spaceID: string
        }
    }
    requestUserMedia: (spaceID: string) => void
    initPlayground: () => void
    loadMediaDevices: (callback?: () => void) => void
    userMedia: boolean
    cameras: string[]
    spaces: Space[]
    microphones: string[]
    joinedSpace: boolean,
    sendLogout: () => void,
}

interface State {
    spaceName: string
}

export class Playground extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const spaceName = this.props.spaces.find(space => space.id === this.props.match!.params.spaceID)?.name
        this.state = {spaceName: spaceName ?? ""}
        document.title = (spaceName) ? spaceName + " - " + applicationName : applicationName

    }

    componentDidMount() {
        this.props.initPlayground()
        this.props.loadMediaDevices(() => {
            console.log(this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
            if (this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
                this.props.requestUserMedia(this.props.match!.params.spaceID)
        })
        window.onpopstate = (event) => {
            this.props.sendLogout();
        };
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
        this.props.handleZoom(0.1)
    }

    // function handleZoomOut decreases the sizeMultiplier
    handleZoomOut() {
        //this.props.changeSizeMultiplier(this.props.offset.scale - 0.1)
        this.props.handleZoom(-0.1)
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
                        <h1>Hey, {this.props.activeUser.firstName}</h1>
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

        return (
            <div id={"PlaygroundWrapper"}>
                <Navigation title={this.state.spaceName} spaceID={this.props.match?.params.spaceID} />
                <div id={"Playground"} className={"contentWrapper"}>
                    <div className={"navwrapper"}>
                        <Sidebar spaceID={this.props.match!.params.spaceID}/>
                    </div>
                    {this.props.joinedSpace ?
                        <Canvas/>
                        : <Loading/>
                    }
                    <div className="btn">
                        <button onClick={this.handleZoomIn.bind(this)}>+</button>
                        <button onClick={this.handleZoomOut.bind(this)}>-</button>
                    </div>
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
})

const mapDispatchToProps = (dispatch: any) => ({
    sendLogout: () => dispatch(sendLogout()),
    handleZoom: (z: number) => dispatch(handleZoom(z)),
    requestSpaces: () => dispatch(requestSpaces()),
    initPlayground: () => dispatch(initPlayground()),
    requestUserMedia: (spaceID: string) => dispatch(requestUserMediaAndJoin(spaceID)),
    loadMediaDevices: (callback?: () => void) => dispatch(loadAllMediaDevices(callback)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Playground)