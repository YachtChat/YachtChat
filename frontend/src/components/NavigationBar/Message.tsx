import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {sendMessage} from "../../store/webSocketSlice";
import {IoCloseOutline} from "react-icons/all";

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
                <Dialog className={"messagePanel"}
                        open={this.props.open}
                        onClose={this.handleClose.bind(this)}
                        style={style}>
                    <div className={"headlineBox"}>
                        <div className={"buttons"}>
                            <button onClick={this.handleClose.bind(this)} className={"iconButton"}><IoCloseOutline/>
                            </button>
                        </div>
                        <h2>Send message</h2>
                        Send a message to everyone in your proximity
                    </div>
                    <form onSubmit={this.handleSubmit.bind(this)}
                          className={"message"}>
                        <input autoFocus={this.props.open}
                               value={this.state.message}
                               onChange={({target: {value}}) => this.setState({message: value})}/>
                        <button type={"submit"} className={"Button"}>
                            send
                        </button>
                    </form>
                </Dialog>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    sendMessage: (msg: string) => dispatch(sendMessage(msg)),
})

export default connect(undefined, mapDispatchToProps)(MessageComponent)