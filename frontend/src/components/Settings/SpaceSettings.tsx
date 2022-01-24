import React, {Component} from 'react';
import Dialog from '@mui/material/Dialog';
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/model/model";
import MediaSettings from "./MediaSettings";
import {IoCloseOutline, IoCogOutline} from "react-icons/all";
import {sendLogout} from "../../store/webSocketSlice";
import {push} from "connected-react-router";

interface Props {
    user: User
    open: boolean
    onClose: (event: React.MouseEvent) => void
    logout: () => void
}

export class SpaceSettings extends Component<Props> {

    render() {
        return (
            <div>
                <Dialog className={"settingsPanel"}
                        open={this.props.open}
                        onClose={this.props.onClose}
                        aria-labelledby="form-dialog-title">
                    <div className={"settingsPanel"}>
                        <div className={"headlineBox"}>
                            <div className={"buttons"}>
                                <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                    <IoCloseOutline/>
                                </button>
                            </div>
                            <button className={"outlined"} onClick={() => this.props.logout()}>
                                <IoCogOutline/> Go to settings
                            </button>
                            <h1>Settings</h1>
                        </div>
                        <div className={"settings"}>
                            <MediaSettings/>
                            <button onClick={this.props.onClose} className={"settingsButton submit"}>
                                done
                            </button>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => {
        if (window.confirm("Are you sure you want to leave the space?")) {
            dispatch(sendLogout(false))
            dispatch(push("/settings/"))
        }
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceSettings)