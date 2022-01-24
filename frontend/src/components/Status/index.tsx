import React, {Component} from "react";
import {Alert, Collapse, Snackbar} from "@mui/material";
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
                                <Collapse key={m.id} in={true}>
                                    <div>
                                        <Alert style={{ marginTop: "0.5rem" }} severity={m.type === "error" ? "error" : "success"}
                                               onClose={() => this.props.removeStatusMessage(m.id)}>{m.message}</Alert>
                                    </div>
                                </Collapse>
                            )}
                        </TransitionGroup>
                    </div>
                </Snackbar>
            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    statusMessages: state.status.messages,
})

const mapDispatchToProps = (dispatch: any) => ({
    handleError: (success: string) => dispatch(handleError(success)),
    handleSuccess: (success: string) => dispatch(handleSuccess(success)),
    removeStatusMessage: (id: number) => dispatch(removeStatusMessage(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(StatusComponent)
