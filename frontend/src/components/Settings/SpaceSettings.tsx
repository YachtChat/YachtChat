import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {RootState} from "../../store/store";
import {connect} from "react-redux";
import "./style.scss";
import {User} from "../../store/model/model";
import MediaSettings from "./MediaSettings";
import {IoCloseOutline, IoCogOutline} from "react-icons/all";
import {Link} from "react-router-dom";
import {sendLogout} from "../../store/webSocketSlice";

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
                        aria-labelledby="form-dialog-title" >
                    <div className={"headlineBox"}>
                        <div className={"buttons"}>
                            <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                <IoCloseOutline/>
                            </button>
                        </div>
                        <Link to={"settings"} onClick={() => this.props.logout()}>
                            <button className={"outlined"}>
                                <IoCogOutline /> Go to settings
                            </button>
                        </Link>
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

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => dispatch(sendLogout()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceSettings)