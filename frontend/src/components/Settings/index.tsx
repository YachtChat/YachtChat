import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/models";
import MediaSettings from "./MediaSettings";

interface Props {
    user: User
    open: boolean
    onClose: (event: React.MouseEvent) => void
}

export class Index extends Component<Props> {

    render() {
        return (
            <div>
                <Dialog className={"settingsPanel"}
                        open={this.props.open}
                        onClose={this.props.onClose}
                        aria-labelledby="form-dialog-title" >
                    <DialogTitle id="form-dialog-title">Settings</DialogTitle>
                    <div className={"settings"}>
                        <MediaSettings/>
                        <button onClick={this.props.onClose} className={"settingsButton"}>
                            done
                        </button>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: state.userState.activeUser,
})

export default connect(mapStateToProps)(Index)