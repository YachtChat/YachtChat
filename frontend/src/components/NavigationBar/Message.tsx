import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import {connect} from "react-redux";
import {sendMessage} from "../../store/connectionSlice";

interface Props {
    open: boolean
    onClose: (e: React.MouseEvent) => void
    sendMessage: (msg: string) => void
}

interface State {
    message: string
}

export class MessageComponent extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            message: ""
        }
    }

    render() {
        return (
            <div>
                <Dialog className={"messagePanel"} open={this.props.open} onClose={this.props.onClose}
                        aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Send message</DialogTitle>
                    <div className={"message"}>
                        <input value={this.state.message}
                               onChange={({target: {value}}) => this.setState({message: value})}/>
                        <button onClick={e => {
                            this.props.sendMessage(this.state.message)
                            this.props.onClose(e)
                        }} className={"Button"}>
                            send
                        </button>
                    </div>
                </Dialog>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    sendMessage: (msg: string) => dispatch(sendMessage(msg)),
})

export default connect(undefined, mapDispatchToProps)(MessageComponent)