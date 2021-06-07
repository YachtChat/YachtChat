import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import {
    FaBars,
    FaCog,
    FaMicrophone,
    FaMicrophoneSlash,
    FaPlusCircle,
    FaSignOutAlt,
    FaVideo,
    FaVideoSlash
} from 'react-icons/fa';
import {MdFilterCenterFocus} from 'react-icons/md';
import RangeSlider from "./RangeSlider"
import {sendLogout} from "../../store/webSocketSlice";
import {displayVideo, mute} from "../../store/rtcSlice";
import Settings from "../Settings";
import {centerUser} from "../../store/playgroundSlice";
import {IoChatbubble} from "react-icons/all";
import MessageComponent from "./Message";
import {Link} from "react-router-dom";
import {FRONTEND_URL} from "../../store/config";
import {getInvitationToken} from "../../store/spaceSlice";
import {handleSuccess} from "../../store/statusSlice";

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
    token?: string
    value: string
    collapsed: boolean
    className: string
    messagesOpen: boolean
    settingsOpen: boolean
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
            value: "",
            collapsed: true,
            className: "navbar collapsed",
            settingsOpen: false,
            messagesOpen: false
        }
    }

    componentDidMount() {
        this.props.getToken(this.props.spaceID).then(token => {
            console.log(token)
            this.setState({
                token: token
            })
        }).catch(() => console.log("NOPE"))
    }

    // function that changes the state of value, used in the username input
    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    // function that switches the state of the navigationbar bar (collapsed/not collapsed)
    handleCollapse(event: any) {
        if (this.state.collapsed) {
            this.setState({
                collapsed: false,
                className: "navbar"
            })
        } else if (!this.state.collapsed) {
            this.setState({
                collapsed: true,
                className: "navbar collapsed"
            })
        }
    }

    // function that switches the state of the navigationbar bar (collapsed/not collapsed)
    handleHoverCollapse(event: any) {
        if (!this.state.collapsed) {
            this.setState({
                collapsed: true,
                className: "navbar collapsed"
            })
        }
    }

    handleSettingsOpen(event: any) {
        if (!this.state.settingsOpen) {
            this.setState({
                settingsOpen: true,
            })
        }
    }

    handleMessagesOpen(event: any) {
        if (!this.state.messagesOpen) {
            this.setState({
                messagesOpen: true,
            })
        }
    }

    handleClose() {
        if (this.state.messagesOpen || this.state.settingsOpen) {
            this.setState({
                settingsOpen: false,
                messagesOpen: false
            })
        }
        console.log(this.state)
    }


    render() {
        const micIcon = (this.props.muted) ? this.icons.micOffIcon : this.icons.micOnIcon
        const videoIcon = (this.props.video) ? this.icons.videoOnIcon : this.icons.videoOffIcon
        return (
            <div id="sidebar" className={this.state.className} onMouseLeave={this.handleHoverCollapse.bind(this)}>
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
                                <li className="menu-item"
                                    onClick={e => {
                                        e.preventDefault()
                                        navigator.clipboard.writeText("https://" + FRONTEND_URL + "/join/" + this.state.token)
                                        this.props.success("Invite link copied")
                                        console.log(this.state)}}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            <FaPlusCircle/>
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Add User
                                    </span>
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
                                        onClick={() => this.setState(this.handleMessagesOpen.bind(this))}
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
                                        <MessageComponent open={this.state.messagesOpen}
                                                          onClose={this.handleClose.bind(this)}/>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={this.handleSettingsOpen.bind(this)}>
                                    <div className="inner-item">
                                        <span className="icon-wrapper">
                                            <span className="icon">
                                                <FaCog/>
                                            </span>
                                        </span>
                                        <span className="item-content">
                                            Settings
                                            <div>
                                                <Settings open={this.state.settingsOpen}
                                                          onClose={this.handleClose.bind(this)}/>
                                            </div>
                                        </span>
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