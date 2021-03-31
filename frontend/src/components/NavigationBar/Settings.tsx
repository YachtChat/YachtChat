import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {RootState} from "../../store/store";
import {connect} from "react-redux";

interface Props {
    open: boolean
    onClose: (event: React.MouseEvent) => void
}

export class Settings extends Component<Props> {


    render() {
        return (
        <div>
            <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Settings</DialogTitle>
                <DialogContent>
                    <div className={"settings-item"}>
                        <DialogContentText className={"dialog-content-text"}>
                            Change Video device (not working at the moment)
                        </DialogContentText>
                        <div className="dropdown">
                            {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                            <select id="videodevices" name="videodevices">
                                <option value="video one">Video one</option>
                                <option value="video two">Video two</option>
                            </select>
                        </div>
                    </div>
                    <div className={"settings-item"}>
                        <DialogContentText>
                            Change Audio device (not working at the moment)
                        </DialogContentText>
                        <div className="dropdown">
                            {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                            <select id="audiodevices" name="audiodevices">
                                <option value="audio one">Audio one</option>
                                <option value="audio two">Audio two</option>
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose} id={"btn-settings"}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

export default connect(mapStateToProps)(Settings)