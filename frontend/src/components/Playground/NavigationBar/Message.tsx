import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {sendMessage} from "../../../store/webSocketSlice";

interface Props {
    open: boolean
    onClose: () => void
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

    handleSubmit() {
        this.props.sendMessage(this.state.message)
        this.handleClose()
    }

    handleClose() {
        this.setState({
            message: ""
        })
        this.props.onClose()
    }

    render() {
        const style = {
            display: (this.props.open) ? "block" : "none"
        }

        return (
            <div>
                <Dialog open={this.props.open}
                        onClose={this.handleClose.bind(this)}
                        style={style}>
                    <div className={"panel"}>
                        <div className={"headlineBox"}>
                            <h2>Send message</h2>
                            Send a message to everyone in your proximity
                        </div>
                        <div className={"panelContent"}>
                            <form onSubmit={e => {
                                e.preventDefault()
                                this.handleSubmit()
                            }}
                                  className={"message"}>
                                <input autoFocus={this.props.open}
                                       placeholder={"write message..."}
                                       value={this.state.message}
                                       onChange={({target: {value}}) => this.setState({message: value})}/>
                                <button type={"submit"} className={"Button"}>
                                    send
                                </button>
                                <button onClick={this.handleClose.bind(this)} className={"Button"}>
                                    dismiss
                                </button>
                            </form>
                        </div>
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