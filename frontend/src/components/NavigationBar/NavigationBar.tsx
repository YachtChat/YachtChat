import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {submitNameChange} from "../../store/userSlice";
import {connect} from "react-redux";
import {
    FaBars,
    FaCog,
    FaMicrophone,
    FaMicrophoneSlash,
    FaPlusCircle,
    FaPowerOff,
    FaSignOutAlt,
    FaVideo,
    FaVideoSlash
} from 'react-icons/fa';
import {MdFilterCenterFocus} from 'react-icons/md';
import RangeSlider from "./RangeSlider"
import {sendLogout} from "../../store/connectionSlice";
import {displayVideo, mute} from "../../store/rtcSlice";
import Settings from "./Settings";
import {centerUser} from "../../store/playgroundSlice";

interface Props {
    activeUser: User
    setName: (name: string) => void
    logout: () => void
    toggleAudio: () => void
    toggleVideo: () => void
    center: () => void
    video: boolean
    muted: boolean
}

interface State {
    value: string
    collapsed: boolean
    className: string
    open: boolean
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
            open: false
        }
    }

    // function that changes the state of value, used in the username input
    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    // function that sets the username after the login is submitted
    handleSubmit(event: any) {
        this.props.setName(this.state.value)
        event.preventDefault();
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
        if (!this.state.open) {
            this.setState({
                open: true,
            })
        }
    }

    handleSettingsClosed(event: any) {
        if (this.state.open) {
            this.setState({
                open: false,
            })
        }
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
                                <li className="menu-item">
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
                                                <Settings open={this.state.open}
                                                          onClose={this.handleSettingsClosed.bind(this)}/>
                                            </div>
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            <FaSignOutAlt/>
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Leave Room
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={this.props.logout}>
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon">
                                            <FaPowerOff/>
                                        </span>
                                    </span>
                                        <span className="item-content">
                                        Log Out
                                    </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    video: state.rtc.video,
    muted: state.rtc.muted
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(submitNameChange(name)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo()),
    logout: () => dispatch(sendLogout()),
    center: () => dispatch(centerUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar)