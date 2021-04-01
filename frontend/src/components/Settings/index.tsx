import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {getMediaDevices,} from "../../store/rtcSlice";
import {User} from "../../store/models";
import MediaSettings from "./MediaSettings";

interface Props {
    user: User
    open: boolean
    onClose: (event: React.MouseEvent) => void
}

export class Index extends Component<Props> {

    render() {
        const mediaDevices = getMediaDevices()
        return (
            <div>
                <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Settings</DialogTitle>
                    <DialogContent className={"settings"}>
                        <MediaSettings/>
                        <button onClick={this.props.onClose} className={"settingsButton"}>
                            done
                        </button>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
})

export default connect(mapStateToProps)(Index)