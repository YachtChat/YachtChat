import React, {Component} from "react";
import {Snackbar} from "@mui/material";
import MuiAlert, {AlertProps} from "@mui/material/Alert";
import {RootState} from "../../store/utils/store";
import {handleError, handleSuccess} from "../../store/statusSlice";
import {connect} from "react-redux";

interface Props {
    error?: string
    success?: string
    handleSuccess: (success: string) => void
    handleError: (error: string) => void
}

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export class StatusComponent extends Component<Props> {

    handleErrorClose() {

    }

    handleSuccessClose() {

    }

    render() {
        return (
            <div>
                <Snackbar open={!!this.props.success} autoHideDuration={4000}
                          onClose={this.handleSuccessClose.bind(this)}>
                    <Alert severity="success">
                        {this.props.success}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!this.props.error} autoHideDuration={4000} onClose={this.handleErrorClose.bind(this)}>
                    <Alert severity="error">
                        {this.props.error}
                    </Alert>
                </Snackbar>
            </div>
        )
    }

}

const mapStateToProps = (state: RootState) => ({
    error: state.status.error,
    success: state.status.success
})

const mapDispatchToProps = (dispatch: any) => ({
    handleError: (success: string) => dispatch(handleError(success)),
    handleSuccess: (success: string) => dispatch(handleSuccess(success))
})

export default connect(mapStateToProps, mapDispatchToProps)(StatusComponent)
