import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {connect} from "react-redux";
import {sendMessage} from "../../store/connectionSlice";

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
                <Dialog className={"messagePanel messagePanel"} open={this.props.open} onClose={this.props.onClose}
                        style={style}>
                    <div className={"headlineBox"}>
                        <h2>Send message</h2>
                        <p>Send a message to everyone in your proximity</p>
                    </div>
                    <div className={"message"}>
                        <input onSubmit={this.handleSubmit.bind(this)} autoFocus={this.props.open}
                               value={this.state.message}
                               onChange={({target: {value}}) => this.setState({message: value})}/>
                        <button onClick={e => {
                            this.props.sendMessage(this.state.message)
                            this.props.onClose()
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