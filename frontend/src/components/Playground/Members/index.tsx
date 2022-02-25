import React, {Component} from 'react';
import Dialog from '@mui/material/Dialog';
import {connect} from "react-redux";
import {IoCloseOutline, IoLink} from "react-icons/io5";
import UserList from "./UserList";
import {RootState} from "../../../store/utils/store";
import {Tooltip} from "@mui/material";
import {getInvitationToken} from "../../../store/spaceSlice";
import {copyInviteLink} from "../../../store/utils/utils";

interface Props {
    open: boolean
    onClose: () => void
    spaceID: string
    invite: (sid: string) => void
    getToken: (sid: string) => Promise<string>
    getSpaceName: (sid: string) => string
}

export class MembersComponent extends Component<Props> {

    constructor(props: Props) {
        super(props);

    }

    render() {
        const style = {
            display: (this.props.open) ? "block" : "none",
        }

        return (
            <div>
                <Dialog open={this.props.open}
                        onClose={this.props.onClose}
                        style={style}>
                    <div className={"panel"}>

                        <div className={"headlineBox"}>
                            <div className={"buttons"}>
                                <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                    <IoCloseOutline/>
                                </button>
                            </div>
                            <Tooltip title={"Copy invite link"} placement={"top"}
                                     arrow>
                                <button onClick={e => {
                                    e.preventDefault()
                                    this.props.invite(this.props.spaceID)
                                }} className={"outlined"}>
                                    <IoLink/> invite link
                                </button>
                            </Tooltip>

                            <h1>Space Members</h1>
                            {/*<h2>Space Members</h2>*/}
                            See every member of this space - present or not
                        </div>
                        <div className={"panelContent"}>
                            <UserList type={"users"} spaceID={this.props.spaceID}/>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    getToken: (sid: string) => getInvitationToken(state, sid),
    getSpaceName: (sid: string) => state.space.spaces.filter((s) => s.id === sid).map(space => space.name).toString().trim(),
})

const mapDispatchToProps = (dispatch: any) => ({
    invite: (sid: string) => dispatch(copyInviteLink(sid))
})

export default connect(mapStateToProps, mapDispatchToProps)(MembersComponent)