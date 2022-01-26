import {Message, User} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {getUserMessages} from "../../store/userSlice";
import {handleSuccess} from "../../store/statusSlice";
import {connect} from "react-redux";
import React, {Component} from "react";
import {Grow, Popper} from "@mui/material";
import {IoCopyOutline} from "react-icons/io5";

interface OwnProps {
    user: User
    className?: string
    videoObject: HTMLVideoElement
}

interface OtherProps {
    success: (s: string) => void
    messages: Message[]
}

type Props = OwnProps & OtherProps

interface State {
    hovered: boolean
    onMessages: boolean
}

export class MessagesComponent extends Component<Props, State> {

    private messagesEnd: React.RefObject<HTMLDivElement>;
    private closeTimeout: number = -1;

    constructor(props: Props) {
        super(props);

        this.messagesEnd = React.createRef();
        this.state = {
            hovered: false,
            onMessages: false
        }
    }

    componentDidMount() {
        if (this.messagesEnd.current)
            this.messagesEnd.current.scrollIntoView({behavior: "smooth"});
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

        if (this.messagesEnd.current &&
            (prevProps.messages !== this.props.messages ||
                prevState.onMessages !== this.state.onMessages))
            this.messagesEnd.current.scrollIntoView({behavior: "smooth"});

    }

    removeTimeout(onMessages?: boolean) {
        if (this.messagesEnd.current && onMessages !== this.state.onMessages)
            setTimeout(() => {
                    if (this.messagesEnd.current)
                        this.messagesEnd.current!.scrollIntoView({behavior: "smooth"})
                },
                500, [this])


        clearTimeout(this.closeTimeout)
        this.setState({
            hovered: true,
            onMessages: !!onMessages
        })

    }

    startTimeout() {
        clearTimeout(this.closeTimeout)
        this.closeTimeout = window.setTimeout(() =>
                this.setState({
                    hovered: false,
                    onMessages: false
                })
            , 500)
    }

    render() {

        return (
            <Popper placement={"right"}
                    data-class={"clickable"}
                    onClick={() => this.setState({hovered: false})}
                    anchorEl={this.props.videoObject}
                    open={this.state.hovered && this.props.messages.length > 0}>
                <Grow in={this.state.hovered}>
                    <div onMouseOver={() => {
                        this.removeTimeout(true)
                    }}
                         onMouseLeave={() => {
                             this.startTimeout()
                         }}
                         onWheel={e => e.stopPropagation()}
                         className={"messages clickable"}>
                        <label className={"clickable"}>Messages</label>
                        {this.state.onMessages &&
                            <Grow in={this.state.onMessages}>
                                <div className={"messagesWrapper"}>

                                    <table cellSpacing="0" cellPadding="0" className={"clickable"}>

                                        {this.props.messages.map(m =>
                                            <tr className={"clickable message"}>
                                                <td className={"clickable"}>
                                                    <label className={"clickable"}>{m.time}</label>
                                                </td>
                                                <td className={"clickable"}><span ref={this.messagesEnd}
                                                                                  className={"clickable"}>
                                                            {(
                                                                m.message.toLocaleLowerCase().startsWith("http") ||
                                                                m.message.toLocaleLowerCase().startsWith("www.")
                                                            ) ?
                                                                <a href={m.message}
                                                                   className={"clickable"}
                                                                   target="_blank" rel="noopener noreferrer"
                                                                >{m.message}</a> :
                                                                m.message}
                                                        </span></td>
                                                <td className={"clickable"}><IoCopyOutline
                                                    className={"icon clickable"} onClick={(e) => {
                                                    e.preventDefault()
                                                    e.nativeEvent.preventDefault()
                                                    e.stopPropagation()
                                                    e.nativeEvent.stopPropagation()
                                                    navigator.clipboard.writeText(this.props.user.message ?? "")
                                                    this.props.success("copied message")
                                                }}/></td>
                                            </tr>
                                        )}
                                    </table>
                                </div>
                            </Grow>
                        }
                    </div>
                </Grow>
            </Popper>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
    messages: getUserMessages(state, ownProps.user.id)
})

const mapDispatchToProps = (dispatch: any) => ({
    success: (s: string) => dispatch(handleSuccess(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(MessagesComponent)