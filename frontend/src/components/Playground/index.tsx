import React, {Component} from "react";
import {connect} from "react-redux";
import './style.scss';
import Sidebar from "./Sidebar";
import {handleZoom, initPlayground} from "../../store/playgroundSlice";
import Canvas from "./Canvas";
import Wrapper, {Loading} from "../Wrapper";
import {Space} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {requestSpaces} from "../../store/spaceSlice";
import {loadAllMediaDevices, requestUserMediaAndJoin} from "../../store/mediaSlice";
import {Link} from "react-router-dom";
import {IoCamera, IoChevronBack, IoMic} from "react-icons/all";
import {applicationName} from "../../store/utils/config";
import {sendLogout} from "../../store/webSocketSlice";
import Navigation from "../Navigation";
import DoNotDisturb from "./DoNotDisturb";
import {UserWrapper} from "../../store/model/UserWrapper";
import {getUser} from "../../store/userSlice";
import TurnOffCamera from "../Settings/TurnOffCamera";
import {isWindows} from "../../store/utils/utils";

interface Props {
    activeUser: UserWrapper
    handleZoom: (zoom: number) => void
    match?: {
        params: {
            spaceID: string
        }
    }
    requestUserMedia: (spaceID: string, video: boolean, audio: boolean) => void
    initPlayground: () => void
    loadMediaDevices: (callback?: () => void) => void
    requestSpaces: () => void
    userMedia: boolean
    cameras: string[]
    spaces: Space[]
    microphones: string[]
    joinedSpace: boolean,
    sendLogout: () => void,
    dnd: boolean
}

interface State {
    spaceName: string
}

export class Playground extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const spaceName = this.props.spaces.find(space => space.id === this.props.match!.params.spaceID)?.name
        this.state = {spaceName: spaceName ?? ""}
        if (!spaceName)
            this.props.requestSpaces()
    }

    componentDidMount() {
        this.props.initPlayground()
        this.props.loadMediaDevices(() => {
            console.log(this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
            if (this.props.cameras.length !== 0 || this.props.microphones.length !== 0)
                this.props.requestUserMedia(this.props.match!.params.spaceID, true, true)
        })

        window.onpopstate = () => {
            this.props.sendLogout();
        };
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevProps.spaces !== this.props.spaces) {
            const spaceName = this.props.spaces.find(space => space.id === this.props.match!.params.spaceID)?.name
            this.setState({spaceName: spaceName ?? ""})
            document.title = (spaceName) ? spaceName + " - " + applicationName : applicationName
        }
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
                            <Link to={"/"}>
                                <button className={"outlined"}><IoChevronBack /> back to spaces</button>
                            </Link>
                        <h1><IoCamera/> <IoMic/></h1>
                        <h1>Hey, {this.props.activeUser.firstName}</h1>
                        <p>
                            {applicationName} is a video chatting app.<br/>So please click and confirm video to
                            continue with the best experience.
                        </p>
                    </div>
                    <div className={"content"}>
                        <button className={"submit"} onClick={() => {
                            this.props.requestUserMedia(this.props.match!.params.spaceID, true, true)
                        }}>Request camera & microphone
                        </button>
                        <button className={"submit"} onClick={() => {
                            this.props.requestUserMedia(this.props.match!.params.spaceID, false, true)
                        }}>Request only Microphone
                        </button>
                        {isWindows() &&

                        <TurnOffCamera />
                        }
                    </div>
                    <div className={"headlineBox"}>
                        <label>
                            If you are having trouble with joining a space we are happy to help you.
                        </label>
                        <button style={{
                            display: "block",
                            margin: "auto"
                        }} className={"outlined"}>
                            Get help
                        </button>
                    </div>
                </Wrapper>
            )

        if (!this.props.joinedSpace)
            return (
                <Loading/>
            )

        if (this.props.dnd)
            return (
                <DoNotDisturb/>
            )

        return (
            <div id={"PlaygroundWrapper"}>
                <Navigation title={this.state.spaceName} spaceID={this.props.match?.params.spaceID}/>
                <div id={"Playground"} className={"contentWrapper"}>
                    <Sidebar spaceID={this.props.match!.params.spaceID}/>
                    <Canvas spaceID={this.props.match?.params.spaceID ?? ""}/>
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
    activeUser: new UserWrapper(getUser(state)),
    spaces: state.space.spaces,
    microphones: state.media.microphones,
    cameras: state.media.cameras,
    userMedia: state.media.userMedia,
    joinedSpace: !!state.space.joinedSpace,
    dnd: state.media.doNotDisturb,
})

const mapDispatchToProps = (dispatch: any) => ({
    sendLogout: () => dispatch(sendLogout()),
    handleZoom: (z: number) => dispatch(handleZoom(z)),
    requestSpaces: () => dispatch(requestSpaces()),
    initPlayground: () => dispatch(initPlayground()),
    requestUserMedia: (spaceID: string, video: boolean, audio: boolean) => dispatch(requestUserMediaAndJoin(spaceID, video, audio)),
    loadMediaDevices: (callback?: () => void) => dispatch(loadAllMediaDevices(callback)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Playground)