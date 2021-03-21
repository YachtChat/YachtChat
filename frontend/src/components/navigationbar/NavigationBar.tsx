import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {submitNameChange} from "../../store/userSlice";
import {connect} from "react-redux";
import {Menu, MenuItem, ProSidebar, SubMenu} from 'react-pro-sidebar';
import {
    FaBars,
    FaCog,
    FaMicrophone,
    FaMicrophoneSlash,
    FaPowerOff,
    FaSignature,
    FaVideo,
    FaVideoSlash
} from 'react-icons/fa';
import RangeSlider from "./RangeSlider";
import {displayVideo, mute, sendLogout} from "../../store/connectionSlice";

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
            collapsed: true
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
                collapsed: false
            })
        } else if (!this.state.collapsed) {
            this.setState({
                collapsed: true
            })
        }
    }


    render() {
        const micIcon = (this.props.muted) ? this.icons.micOffIcon : this.icons.micOnIcon
        const videoIcon = (this.props.video) ? this.icons.videoOnIcon : this.icons.videoOffIcon
        return (
            <ProSidebar id="sidebar" collapsed={this.state.collapsed}>
                <Menu iconShape="circle">
                    <MenuItem icon={<FaBars/>} onClick={this.handleCollapse.bind(this)}>Dashboard</MenuItem>
                    <SubMenu title="Rename" icon={<FaSignature/>}>
                        <MenuItem>
                            <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)}/>
                            <br/>
                            <button onClick={this.handleSubmit.bind(this)}>
                                Submit
                            </button>
                        </MenuItem>
                    </SubMenu>
                    <MenuItem icon={videoIcon} onClick={this.props.toggleVideo}>Video</MenuItem>
                    <MenuItem icon={micIcon} onClick={this.props.toggleAudio}>Mic</MenuItem>
                    <MenuItem icon={<FaCog/>}>Settings</MenuItem>
                    <MenuItem icon={<FaPowerOff/>} onClick={this.props.logout}>Log Out</MenuItem>
                </Menu>
                <RangeSlider/>
            </ProSidebar>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    video: state.webSocket.video,
    muted: state.webSocket.muted
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(submitNameChange(name)),
    toggleAudio: () => dispatch(mute()),
    toggleVideo: () => dispatch(displayVideo()),
    logout: () => dispatch(sendLogout())
})

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar)