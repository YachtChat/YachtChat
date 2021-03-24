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
                    <DialogContentText>
                        To rename yourself please insert your new username.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="New Username"
                        type="text"
                        fullWidth
                    />
                    <DialogContentText>
                        Change Video device
                    </DialogContentText>
                    <div className="dropdown">
                        {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                        <select id="spaces" name="spaces">
                            <option value="video one">Video one</option>
                            <option value="video two">Video two</option>
                        </select>
                    </div>
                    <DialogContentText>
                        Change Audio device
                    </DialogContentText>
                    <div className="dropdown">
                        {/*<label htmlFor="spaces">Choose a Space:</label>*/}
                        <select id="spaces" name="spaces">
                            <option value="audio one">Audio one</option>
                            <option value="audio two">Audio two</option>
                        </select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose} color="primary">
                        Cancel
                    </Button>
                    <Button color="primary">
                        Rename
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