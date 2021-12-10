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
import Settings from "../../Settings";
import {centerUser} from "../../../store/playgroundSlice";
import {IoChatbubble, IoPeople, IoTv, IoTvOutline} from "react-icons/all";
import MessageComponent from "./Message";
import {getInvitationToken} from "../../../store/spaceSlice";
import {handleSuccess} from "../../../store/statusSlice";
import MembersComponent from "./Members";
import {ClickAwayListener, Grow, Paper, Popper, Tooltip} from "@material-ui/core";
import posthog, {PostHog} from "posthog-js";

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
}

interface State {
    confirmlogout: boolean
    collapsed: boolean
    open: { [component: string]: boolean }
}

export class NavigationBar extends Component<Props, State> {

    anchorRef: React.RefObject<HTMLSpanElement>

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

    sendToPosthog(action: string){
        posthog.capture('Navbar', {'action': action})
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
                                <li className="menu-item" onClick={(e)=>{
                                    this.sendToPosthog("menu");
                                    this.handleCollapse(e)}}>
                                    <div className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={"Menu"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <FaBars/>
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            Menu
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={()=>{
                                    this.sendToPosthog("video");
                                    this.props.toggleVideo()
                                }}>
                                    <div className="inner-item">
                                        <span className="icon-wrapper">
                                            <Tooltip  disableFocusListener
                                                      title={"Video"} placement="right" arrow>
                                                <span className="icon">
                                                    {videoIcon}
                                                </span>
                                            </Tooltip>
                                        </span>
                                        <span className="item-content">
                                            Video
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={()=> {
                                    this.sendToPosthog("microphone")
                                    this.props.toggleAudio()
                                }}>
                                    <div className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={"Microphone"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    {micIcon}
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            Microphone
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item" onClick={()=>{
                                    this.sendToPosthog("screen")
                                    this.props.toggleScreen()
                                }}>
                                    <div className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={(this.props.screen) ? "Stop Sharing" : "Share Screen"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    {(this.props.screen) ? <IoTv/> : <IoTvOutline/>}
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            {(this.props.screen) ? "Stop Sharing" : "Share Screen"}
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <div
                                        onClick={(e)=>{
                                            this.sendToPosthog("users")
                                            this.handleOpen(e, "users")
                                        }}
                                        className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={"Users"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <IoPeople/>
                                                </span>
                                            </span>
                                        </Tooltip>
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
                                <li className="menu-item" onClick={()=>{
                                    this.sendToPosthog("center")
                                    this.props.center()
                                }}>
                                    <div className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={"Center user"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <MdFilterCenterFocus/>
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            Center user
                                        </span>
                                    </div>
                                </li>
                                <li className="menu-item spacer-50">
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item rangeslider">
                                        <RangeSlider sendToPosthog={this.sendToPosthog.bind(this)}/>
                                    </div>
                                    <span className={"item-content"}>Range</span>
                                </li>
                            </ul>
                        </div>
                        <div className="menu bottom">
                            <ul>
                                <li className="menu-item">
                                    <div
                                        onClick={(e)=> {
                                            this.sendToPosthog("message")
                                            this.handleOpen(e, "messages")
                                        }}
                                        className="inner-item">
                                        <Tooltip  disableFocusListener
                                                  title={"Message"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <IoChatbubble/>
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            Message
                                        </span>
                                    </div>
                                    <div>
                                        <MessageComponent open={this.state.open["messages"]}
                                                          onClose={() => this.handleClose("messages")}/>
                                    </div>
                                </li>
                                <li className="menu-item">
                                    <div className="inner-item"
                                         onClick={(e)=>{
                                             this.sendToPosthog("settings")
                                             this.handleOpen(e, "settings")
                                         }}>
                                        <Tooltip  disableFocusListener
                                                  title={"Settings"} placement="right" arrow>
                                            <span className="icon-wrapper">
                                                <span className="icon">
                                                    <FaCog/>
                                                </span>
                                            </span>
                                        </Tooltip>
                                        <span className="item-content">
                                            Settings
                                        </span>
                                    </div>
                                    <div>
                                        <Settings open={this.state.open["settings"]}
                                                  onClose={() => this.handleClose("settings")}/>
                                    </div>
                                </li>
                                <li className="menu-item" >
                                    <div className="inner-item">
                                            { this.state.confirmlogout ?
                                            <span className="icon-wrapper clicked" onClick={()=>{
                                                this.sendToPosthog("logout")
                                                this.props.logout()
                                            }}>

                                                    <ClickAwayListener onClickAway={() => this.setState({confirmlogout: false})}>
                                                        <span  className="icon"><FaSignOutAlt/>  </span>
                                                    </ClickAwayListener>
                                            </span>
                                                    :
                                                <Tooltip  disableFocusListener
                                                               title={"Log Out"} placement="right" arrow>
                                                <span className="icon-wrapper" >
                                                    <span onClick={() => this.setState({confirmlogout: true})} className="icon" >
                                                    <FaSignOutAlt/>
                                                    </span>
                                                </span>
                                            </Tooltip>

                                                }
                                                {/*<span onClick={() => this.setState({confirmlogout: true})} className="icon" ref={this.anchorRef}>
                                                    <FaSignOutAlt/>
                                                </span>
                                                <Popper open={this.state.confirmlogout}
                                                        anchorEl={this.anchorRef.current}
                                                        role={undefined} placement={"right"}
                                                        transition disablePortal

                                                        >
                                                    {({TransitionProps, placement}) => (

                                                        <Grow

                                                            {...TransitionProps}
                                                            style={{transformOrigin: placement === 'bottom' ? 'top' : 'top'}}
                                                        >
                                                            <Paper className={"logoutbutton"} onClick={this.props.logout}>
                                                                <ClickAwayListener onClickAway={() => this.setState({confirmlogout: false})}>

                                                                    <span onClick={this.props.logout} className="icon"><FaSignOutAlt/>  </span>

                                                                </ClickAwayListener>
                                                            </Paper>
                                                        </Grow>
                                                    )}
                                                </Popper>*/}


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