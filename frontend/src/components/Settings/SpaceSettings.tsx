import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/models";
import MediaSettings from "./MediaSettings";
import {IoCloseOutline} from "react-icons/all";

interface Props {
    user: User
    open: boolean
    onClose: (event: React.MouseEvent) => void
}

export class SpaceSettings extends Component<Props> {

    render() {
        return (
            <div>
                <Dialog className={"settingsPanel"}
                        open={this.props.open}
                        onClose={this.props.onClose}
                        aria-labelledby="form-dialog-title" >
                    <div className={"headlineBox"}>
                        <div className={"buttons"}>
                            <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                <IoCloseOutline/>
                            </button>
                        </div>
                        <h1>Settings</h1>
                    </div>
                    <div className={"settings"}>
                        <MediaSettings/>
                        <button onClick={this.props.onClose} className={"settingsButton submit"}>
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

export default connect(mapStateToProps)(SpaceSettings)