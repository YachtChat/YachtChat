import React, {Component} from "react";
import './style.scss';
import {Space, User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {connectToServer} from "../../store/connectionSlice";
import {requestSpaces} from "../../store/spaceSlice";
import Wrapper from "../Wrapper";
import {loadAllMediaDevices, requestUserMedia} from "../../store/rtcSlice";

interface Props {
    activeUser: User
    spaces: Space[]
    connect: (spaceID: string) => void
    requestSpaces: () => void
    requestUserMedia: () => void
    loadMediaDevices: () => void
    userMedia: boolean
    cameras: string[]
    microphones: string[]
}

export class Spaces extends Component<Props> {

    componentDidMount() {
        this.props.requestSpaces()
        this.props.loadMediaDevices()
    }

    render() {
        if (this.props.cameras.length === 0 && this.props.microphones.length === 0)
            return (
                <Wrapper className="spaces">
                    <h1>Hey, {this.props.activeUser.name}.</h1>
                    <p>AlphaBibber Chat is a video chatting app. So please click and confirm video to continue.</p>
                    <button onClick={this.props.requestUserMedia}>Request media</button>
                </Wrapper>
            )
        if (this.props.cameras.length !== 0 && this.props.microphones.length !== 0 && !this.props.userMedia)
            this.props.requestUserMedia()

        return (
            <Wrapper className="spaces">
                <h1>Welcome back, {this.props.activeUser.name}.</h1>
                <p>To join a space, select a space below, or create a new one.</p>

                <div className={"spacesWrapper"}>
                    {this.props.spaces.map((s, idx) => (
                        <div className={"space " + ((idx > 0) ? "separator" : "")}>
                            {s.name}
                            <button onClick={() => this.props.connect(s.id)}>Join</button>
                        </div>
                    ))}
                </div>
            </Wrapper>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaces: state.space.spaces,
    microphones: state.rtc.microphones,
    cameras: state.rtc.cameras,
    userMedia: state.rtc.userMedia
})

const mapDispatchToProps = (dispatch: any) => ({
    requestSpaces: () => dispatch(requestSpaces()),
    connect: (spaceID: string) => dispatch(connectToServer(spaceID)),
    requestUserMedia: () => dispatch(requestUserMedia()),
    loadMediaDevices: () => dispatch(loadAllMediaDevices())
})

export default connect(mapStateToProps, mapDispatchToProps)(Spaces)
