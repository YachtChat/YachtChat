import React, {Component} from "react";
import {Alert, CircularProgress, Collapse, Snackbar} from "@mui/material";
import {RootState} from "../../store/utils/store";
import {handleError, handleSuccess, removeStatusMessage} from "../../store/statusSlice";
import {connect} from "react-redux";
import {StatusMessage} from "../../store/model/model";
import {TransitionGroup} from "react-transition-group";

interface Props {
    statusMessages: StatusMessage[]
    handleSuccess: (success: string) => void
    handleError: (error: string) => void
    removeStatusMessage: (id: number) => void
    reconnect: boolean
    con: boolean
    space: string
}

export class StatusComponent extends Component<Props> {

    render() {
        return (
            <div>
                <Snackbar
                    anchorOrigin={ { vertical: "bottom", horizontal: "center" } }
                    open={true}>
                    <div>

                        <TransitionGroup>
                            {this.props.statusMessages.map(m =>
                                <Collapse key={m.id} in={true} unmountOnExit>
                                    <div>
                                        <Alert style={{ marginTop: "0.5rem" }} severity={m.type === "error" ? "error" : "success"}
                                               onClose={() => this.props.removeStatusMessage(m.id)}>{m.message}</Alert>
                                    </div>
                                </Collapse>
                            )}
                            {this.props.reconnect &&
                            <Collapse key={"unconnect"} unmountOnExit>
                                <div>
                                    <Alert style={{ marginTop: "0.5rem" }} severity={"warning"}>
                                        Unstable internet connection. Trying to reconnect.
                                        <CircularProgress style={{ margin: "0 0.5rem" }} size={15} color={"inherit"} />
                                    </Alert>
                                </div>
                            </Collapse>
                            }
                        </TransitionGroup>
                    </div>
                </Snackbar>
            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    statusMessages: state.status.messages,
    reconnect: (!state.webSocket.connected && !!state.space.joinedSpace),
    con: !!state.webSocket.connected,
    space: state.space.joinedSpace ?? "",
})

const mapDispatchToProps = (dispatch: any) => ({
    handleError: (success: string) => dispatch(handleError(success)),
    handleSuccess: (success: string) => dispatch(handleSuccess(success)),
    removeStatusMessage: (id: number) => dispatch(removeStatusMessage(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(StatusComponent)
