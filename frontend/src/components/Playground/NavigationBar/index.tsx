import React, {Component} from "react";
import './style.scss';
import {User} from "../../../store/models";
import {RootState} from "../../../store/store";
import {connect} from "react-redux";
import {FaBars, FaCog, FaMicrophone, FaMicrophoneSlash, FaSignOutAlt, FaVideo, FaVideoSlash} from 'react-icons/fa';
import {MdFilterCenterFocus} from 'react-icons/md';
import RangeSlider from "./RangeSlider"
import {sendLogout} from "../../../store/webSocketSlice";
import {displayVideo, mute} from "../../../store/rtcSlice";
import Settings from "../../Settings";
import {centerUser} from "../../../store/playgroundSlice";
import {IoChatbubble, IoPeople} from "react-icons/all";
import MessageComponent from "./Message";
import {Link} from "react-router-dom";
import {getInvitationToken} from "../../../store/spaceSlice";
import {handleSuccess} from "../../../store/statusSlice";
import MembersComponent from "./Members";

interface Props {
    getToken: (spaceID: string) => Promise<string>
    spaceID: string
    success: (s: string) => void
    activeUser: User
    logout: () => void
    toggleAudio: () => void
    toggleVideo: () => void
    center: () => void
    video: boolean
    muted: boolean
}

interface State {
    collapsed: boolean
    open: { [component: string]: boolean }
}

export class NavigationBar extends Component<Props, State> {

    icons = {
        videoOnIcon: <FaVideo/>,
        videoOffIcon: <FaVideoSlash/>,
        micOnIcon: <FaMicrophone/>,
        micOffIcon: <FaMicrophoneSlash/>,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            collapsed: true,
            open: {}
        }
    }

    // function that switches the state of the navigationbar bar (collapsed/not collapsed)
    handleCollapse(event: any) {
        if (this.state.collapsed) {
            this.setState({
                collapsed: false,
            })
        } else if (!this.state.collapsed) {
            this.setState({
                collapsed: true,
            })
        }
    }

    // function that switches the state of the navigationbar bar (collapsed/not collapsed)
    handleHoverCollapse(event: any) {
        if (!this.state.collapsed) {
            this.setState({
                collapsed: true,
            })
        }
    }

    handleOpen(event: any, component: string) {
        if (!this.state.open[component]) {
            this.setState({
                open: {[component]: true},
            })
        }
    }

    handleClose(component: string) {
        if (this.state.open[component]) {
            this.setState({
                open: {}
            })
        }
    }


    render() {
        const micIcon = (this.props.muted) ? this.icons.micOffIcon : this.icons.micOnIcon
        const videoIcon = (this.props.video) ? this.icons.videoOnIcon : this.icons.videoOffIcon
        return (
            <div id="sidebar" className={"navbar " + ((this.state.collapsed) ? "collapsed" : "")}
                 onMouseLeave={this.handleHoverCollapse.bind(this)}>
                <div className="navbar-inner">
                    <div className="navbar-layout">
                        <div className="menu">
                            <ul>
                                <li className="menu-item" onClick={this.handleCollapse.bind(this)}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            <FaBars/>
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Dashboard
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={this.props.toggleVideo}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            {videoIcon}
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Video
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={this.props.toggleAudio}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            {micIcon}
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Microphone
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <div
                                        onClick={e => this.handleOpen(e, "users")}
                                        className="inner-item">
                                        <span className="icon-wrapper">
                                            <span className="icon">
                                                <IoPeople/>
                                            </span>
                                        </span>
                                        <span className="item-content">
                                            Users
                                        </span>
                                    </div>
                                    <div>
                                        <MembersComponent open={this.state.open["users"]}
                                                          spaceID={this.props.spaceID}
                                                          onClose={() => this.handleClose("users")}/>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={this.props.center}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            <MdFilterCenterFocus/>
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Center user
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item spacer-50">
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item rangeslider">
                                        <RangeSlider/>
                                    </div>
                                    <span className={"item-content"}>Range</span>
                                </li>
                            </ul>
                        </div>
                        <div className="menu bottom">
                            <ul>
                                <li className="menu-item">
                                    <div
                                        onClick={e => this.handleOpen(e, "messages")}
                                        className="inner-item">
                                        <span className="icon-wrapper">
                                            <span className="icon">
                                                <IoChatbubble/>
                                            </span>
                                        </span>
                                        <span className="item-content">
                                            Message
                                        </span>
                                    </div>
                                    <div>
                                        <MessageComponent open={this.state.open["messages"]}
                                                          onClose={() => this.handleClose("messages")}/>
                                    </div>
                                </li>
                                <li className="menu-item" >
                                    <div
                                        onClick={e => this.handleOpen(e, "settings")}
                                        className="inner-item">
                                        <span className="icon-wrapper">
                                            <span className="icon">
                                                <FaCog/>
                                            </span>
                                        </span>
                                        <span className="item-content">
                                            Settings
                                        </span>
                                    </div>
                                    <div>
                                        <Settings open={this.state.open["settings"]}
                                                  onClose={() => this.handleClose("settings")}/>
                                    </div>
                                </li>
                                <Link to={"/spaces/"}>
                                    <li className="menu-item" onClick={this.props.logout}>
                                        <div className="inner-item">
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <FaSignOutAlt/>
                                                </span>
                                            </span>
                                            <span className="item-content">
                                                Log Out
                                            </span>
                                        </div>
                                    </li>
                                </Link>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    getToken: (spaceID: string) => getInvitationToken(state, spaceID),
    spaces: state.space.spaces,
    activeUser: state.userState.activeUser,
    video: state.rtc.video,
    muted: state.rtc.muted
})

const mapDispatchToProps = (dispatch: any) => ({
    success: (s: string) => dispatch(handleSuccess(s)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo()),
    logout: () => dispatch(sendLogout()),
    center: () => dispatch(centerUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar)