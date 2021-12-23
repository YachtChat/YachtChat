import React, {Component} from 'react';
import {connect} from "react-redux";
import {sendMessage} from "../../../store/webSocketSlice";
import {IoCloseOutline} from "react-icons/all";
import {Popover} from "@material-ui/core";

interface Props {
    open: boolean
    onClose: () => void
    sendMessage: (msg: string) => void
    button: Element | null
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
        if (!this.props.button)
            return (<div />)
        return (
            <div>
                <Popover open={this.props.open}
                        onClose={this.handleClose.bind(this)}
                        style={style}
                         anchorEl={this.props.button}
                         anchorOrigin={{
                             vertical: 'top',
                             horizontal: 'right',
                         }}
                >
                    <div className={"panel"}>
                        <div className={"headlineBox"}>
                            <div className={"buttons"}>
                                <button onClick={this.props.onClose} className={"iconButton nostyle"}>
                                    <IoCloseOutline/>
                                </button>
                            </div>
                            <h1>Send message</h1>
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
                                <button type={"submit"} className={"Button submit"}>
                                    send
                                </button>
                            </form>
                        </div>
                    </div>
                </Popover>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    sendMessage: (msg: string) => dispatch(sendMessage(msg)),
})

export default connect(undefined, mapDispatchToProps)(MessageComponent)