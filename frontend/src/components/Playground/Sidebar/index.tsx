import React, {Component} from "react";
import './style.scss';
import {User} from "../../../store/models";
import {RootState} from "../../../store/store";
import {connect} from "react-redux";
import {FaBars, FaCog, FaMicrophone, FaMicrophoneSlash, FaSignOutAlt, FaVideo, FaVideoSlash} from 'react-icons/fa';
import {MdFilterCenterFocus} from 'react-icons/md';
import RangeSlider from "./RangeSlider"
import {sendLogout} from "../../../store/webSocketSlice";
import {toggleUserVideo, mute, toggleUserScreen} from "../../../store/rtcSlice";
import Settings from "../../Settings/SpaceSettings";
import {centerUser} from "../../../store/playgroundSlice";
import {IoChatbubble, IoChevronBackOutline, IoPeople, IoTv, IoTvOutline} from "react-icons/all";
import MessageComponent from "./Message";
import {getInvitationToken} from "../../../store/spaceSlice";
import {handleSuccess} from "../../../store/statusSlice";
import MembersComponent from "./Members";
import {ClickAwayListener, Tooltip} from "@material-ui/core";
import posthog from "posthog-js";

interface Props {
    getToken: (spaceID: string) => Promise<string>
    spaceID: string
    success: (s: string) => void
    activeUser: User
    logout: () => void
    toggleAudio: () => void
    toggleVideo: () => void
    toggleScreen: () => void
    center: () => void
    video: boolean
    muted: boolean
    screen: boolean
    minimal?: boolean
    className?: string
}

interface State {
    confirmlogout: boolean
    open: { [component: string]: boolean }
}

export class NavigationBar extends Component<Props, State> {

    anchorRef: React.RefObject<HTMLDivElement>

    icons = {
        videoOnIcon: <FaVideo/>,
        videoOffIcon: <FaVideoSlash/>,
        micOnIcon: <FaMicrophone/>,
        micOffIcon: <FaMicrophoneSlash/>,
    };

    constructor(props: Props) {
        super(props);

        this.anchorRef = React.createRef()

        this.state = {
            confirmlogout: false,
            open: {}
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

    sendToPosthog(action: string) {
        posthog.capture('Navbar', {'action': action})
    }


    render() {
        const micIcon = (this.props.muted) ? this.icons.micOffIcon : this.icons.micOnIcon
        const videoIcon = (this.props.video) ? this.icons.videoOnIcon : this.icons.videoOffIcon
        return (
            <div className={"navwrapper"}>
                <div id="sidebar" ref={this.anchorRef} className={"navbar " + (this.props.minimal ? "minimal " : "") + this.props.className}>
                    <div className="navbar-inner">
                        <div className="navbar-layout">
                            <div className="menu">
                                <ul>
                                    <li className="menu-item" onClick={() => {
                                        this.sendToPosthog("menu");
                                    }}>
                                        <div className="inner-item">
                                            <Tooltip disableFocusListener
                                                     title={"Menu"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <FaBars/>
                                                </span>
                                            </span>
                                            </Tooltip>
                                        </div>
                                    </li>
                                    <li className="menu-item" onClick={() => {
                                        this.sendToPosthog("video");
                                        this.props.toggleVideo()
                                    }}>
                                        <div className="inner-item">
                                        <span className="icon-wrapper">
                                            <Tooltip disableFocusListener
                                                     title={"Video"} placement="right" arrow>
                                                <span className="icon">
                                                    {videoIcon}
                                                </span>
                                            </Tooltip>
                                        </span>
                                        </div>
                                    </li>
                                    <li className="menu-item" onClick={() => {
                                        this.sendToPosthog("microphone")
                                        this.props.toggleAudio()
                                    }}>
                                        <div className="inner-item">
                                            <Tooltip disableFocusListener
                                                     title={"Microphone"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    {micIcon}
                                                </span>
                                            </span>
                                            </Tooltip>
                                        </div>
                                    </li>
                                    <li className="menu-item" onClick={() => {
                                        this.sendToPosthog("screen")
                                        this.props.toggleScreen()
                                    }}>
                                        <div className="inner-item">
                                            <Tooltip disableFocusListener
                                                     title={(this.props.screen) ? "Stop Sharing" : "Share Screen"}
                                                     placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    {(this.props.screen) ? <IoTv/> : <IoTvOutline/>}
                                                </span>
                                            </span>
                                            </Tooltip>
                                        </div>
                                    </li>
                                    {!this.props.minimal &&
                                        <li className="menu-item">
                                            <div
                                                onClick={(e) => {
                                                    this.sendToPosthog("users")
                                                    this.handleOpen(e, "users")
                                                }}
                                                className="inner-item">
                                                <Tooltip disableFocusListener
                                                         title={"Users"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <IoPeople/>
                                                </span>
                                            </span>
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <MembersComponent open={this.state.open["users"]}
                                                                  spaceID={this.props.spaceID}
                                                                  onClose={() => this.handleClose("users")}/>
                                            </div>
                                        </li>
                                    }
                                    {!this.props.minimal &&
                                        <li className="menu-item" onClick={() => {
                                            this.sendToPosthog("center")
                                            this.props.center()
                                        }}>
                                            <div className="inner-item">
                                                <Tooltip disableFocusListener
                                                         title={"Center user"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <MdFilterCenterFocus/>
                                                </span>
                                            </span>
                                                </Tooltip>
                                            </div>
                                        </li>
                                    }
                                    {!this.props.minimal &&
                                        <li className="menu-item">
                                            <div className="inner-item rangeslider">
                                                <RangeSlider sendToPosthog={this.sendToPosthog.bind(this)}/>
                                            </div>
                                            <span className={"item-content"}>Range</span>
                                        </li>
                                    }
                                </ul>
                            </div>
                            <div className="menu bottom">
                                <ul>
                                    <li className="menu-item">
                                        <div
                                            onClick={(e) => {
                                                this.sendToPosthog("message")
                                                this.handleOpen(e, "messages")
                                            }}
                                            className="inner-item">
                                            <Tooltip disableFocusListener
                                                     title={"Message"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <IoChatbubble/>
                                                </span>
                                            </span>
                                            </Tooltip>
                                        </div>
                                        <div>
                                            <MessageComponent button={this.anchorRef.current}

                                                              open={this.state.open["messages"]}
                                                              onClose={() => this.handleClose("messages")}/>
                                        </div>
                                    </li>
                                    {!this.props.minimal &&
                                        <li className="menu-item">
                                            <div className="inner-item"
                                                 onClick={(e) => {
                                                     this.sendToPosthog("settings")
                                                     this.handleOpen(e, "settings")
                                                 }}>
                                                <Tooltip disableFocusListener
                                                         title={"Settings"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <FaCog/>
                                                </span>
                                            </span>
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <Settings open={this.state.open["settings"]}
                                                          onClose={() => this.handleClose("settings")}/>
                                            </div>
                                        </li>
                                    }
                                    <li className="menu-item">
                                        <div className="inner-item">
                                            {this.state.confirmlogout ?
                                                <span className="icon-wrapper clicked" onClick={() => {
                                                    this.sendToPosthog("logout")
                                                    this.props.logout()
                                                }}>

                                                    <ClickAwayListener
                                                        onClickAway={() => this.setState({confirmlogout: false})}>
                                                        <span className="icon"><IoChevronBackOutline/>  </span>
                                                    </ClickAwayListener>
                                            </span>
                                                :
                                                <Tooltip disableFocusListener
                                                         title={"back to spaces"} placement="right" arrow>
                                                <span className="icon-wrapper">
                                                    <span onClick={() => this.setState({confirmlogout: true})}
                                                          className="icon">
                                                    <IoChevronBackOutline/>
                                                    </span>
                                                </span>
                                                </Tooltip>

                                            }
                                        </div>
                                    </li>
                                </ul>
                            </div>
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
    muted: state.rtc.muted,
    screen: state.rtc.screen
})

const mapDispatchToProps = (dispatch: any) => ({
    success: (s: string) => dispatch(handleSuccess(s)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(toggleUserVideo()),
    toggleScreen: () => dispatch(toggleUserScreen()),
    logout: () => dispatch(sendLogout()),
    center: () => dispatch(centerUser()),
})

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar)