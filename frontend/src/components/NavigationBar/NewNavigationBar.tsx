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
    FaSignature,
    FaSignOutAlt,
    FaVideo,
    FaVideoSlash
} from 'react-icons/fa';
import RangeSlider from "./RangeSlider"
import {sendLogout} from "../../store/connectionSlice";
import {displayVideo, mute} from "../../store/rtcSlice";

interface Props {
    activeUser: User
    setName: (name: string) => void
    logout: () => void
    toggleAudio: () => void
    toggleVideo: () => void
    video: boolean
    muted: boolean
}

interface State {
    value: string
    collapsed: boolean
    className: string
}

export class NewNavigationBar extends Component<Props, State> {

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
            className: "navbar collapsed"
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
                collapsed: true
            })
        }
    }


    render() {
        const micIcon = (this.props.muted) ? this.icons.micOffIcon : this.icons.micOnIcon
        const videoIcon = (this.props.video) ? this.icons.videoOnIcon : this.icons.videoOffIcon
        return (
            <div className={this.state.className}>
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
                                <li className="menu-item">
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon" onClick={this.props.toggleVideo}>
                                            {videoIcon}
                                        </span>
                                    </span>
                                    <span className="item-content" onClick={this.props.toggleVideo}>
                                        Video
                                    </span>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon" onClick={this.props.toggleAudio}>
                                            {micIcon}
                                        </span>
                                    </span>
                                    <span className="item-content" onClick={this.props.toggleAudio}>
                                        Mic
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
                                <li className="menu-item spacer-50">
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item rangeslider">
                                        <RangeSlider/>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="menu bottom">
                            <ul>
                                <li className="menu-item">
                                    <div className="inner-item">
                                        <span className="icon-wrapper">
                                            <span className="icon">
                                                <FaCog/>
                                            </span>
                                        </span>
                                        <span className="item-content">
                                            Settings
                                        </span>
                                        {/*<span className="arrow-wrapper">

                                        </span>*/}
                                    </div>
                                    <div className="submenu-item react-slidedown closed">
                                        <ul>
                                            <li className="menu-item">
                                                <div className="inner-item">
                                                    <span className="icon-wrapper">
                                                        <span className="icon">
                                                            <FaCog/>
                                                        </span>
                                                    </span>
                                                    <span className="item-content">
                                                        Settings
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
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
                                <li className="menu-item">
                                    <div className="inner-item">
                                    <span className="icon-wrapper">
                                        <span className="icon" onClick={this.props.logout}>
                                            <FaPowerOff/>
                                        </span>
                                    </span>
                                        <span className="item-content" onClick={this.props.logout}>
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
    logout: () => dispatch(sendLogout())
})

export default connect(mapStateToProps, mapDispatchToProps)(NewNavigationBar)