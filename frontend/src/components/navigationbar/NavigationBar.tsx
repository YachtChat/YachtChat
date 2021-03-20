import React, {Component} from "react";
import './style.scss';
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {submitNameChange} from "../../store/userSlice";
import {connect} from "react-redux";
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FaSignature, FaCog, FaBars, FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import RangeSlider from "./RangeSlider";

interface Props {
    activeUser: User
    setName: (name: string) => void
}

interface State {
    value: string
    collapsed: boolean
    video: boolean
    audio: boolean
}

export class NavigationBar extends Component<Props, State> {

    icons = {
        videoIcon: <FaVideo />,
        videoOnIcon: <FaVideo />,
        videoOffIcon: <FaVideoSlash />,
        micIcon: <FaMicrophone />,
        micOnIcon: <FaMicrophone />,
        micOffIcon: <FaMicrophoneSlash />,
    };


    constructor(props: Props) {
        super(props);
        this.state = {
            value: "",
            collapsed: true,
            video: true,
            audio: true
        }
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event: any) {
        this.props.setName(this.state.value)
        event.preventDefault();
    }

    handleCollapse(event: any){
        if (this.state.collapsed){
            this.setState({
                collapsed: false
            })
        }
        else if (!this.state.collapsed){
            this.setState({
                collapsed: true
            })
        }
    }

    handleVideoIcon(event: any){
        if (this.state.video){
            this.setState({
                video: false
            })
            this.icons.videoIcon = this.icons.videoOffIcon
        }
        else if (!this.state.video){
            this.setState({
                video: true
            })
            this.icons.videoIcon = this.icons.videoOnIcon
        }
    }

    handleAudioIcon(event: any){
        if (this.state.audio){
            this.setState({
                audio: false
            })
            this.icons.micIcon = this.icons.micOffIcon
        }
        else if (!this.state.audio){
            this.setState({
                audio: true
            })
            this.icons.micIcon = this.icons.micOnIcon
        }
    }

    render() {
        return(

            <ProSidebar id="sidebar" collapsed={this.state.collapsed}> {/* collapse prop is for big/small sidebar*/}
                <Menu iconShape="circle">
                    <MenuItem icon={<FaBars />} onClick={this.handleCollapse.bind(this)}>Dashboard</MenuItem>
                    <SubMenu title="Rename" icon={<FaSignature />}>
                        <MenuItem>
                            <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
                        <br />
                            <button onClick={this.handleSubmit.bind(this)}>
                                Submit
                            </button>
                        </MenuItem>
                    </SubMenu>
                    <MenuItem icon={this.icons.videoIcon} onClick={this.handleVideoIcon.bind(this)}>Video</MenuItem>
                    <MenuItem icon={this.icons.micIcon} onClick={this.handleAudioIcon.bind(this)}>Mic</MenuItem>
                    <MenuItem icon={<FaCog />}>Settings</MenuItem>
                </Menu>
                <RangeSlider />
            </ProSidebar>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    setName: (name: string) => dispatch(submitNameChange(name)),
})

export default connect(mapStateToProps,  mapDispatchToProps)(NavigationBar)