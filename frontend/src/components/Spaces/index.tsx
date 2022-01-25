import React, {Component} from "react";
import './style.scss';
import {Space} from "../../store/model/model";
import {connect} from "react-redux";
import {RootState} from "../../store/utils/store";
import {deleteSpaceForUser, requestSpaces} from "../../store/spaceSlice";
import Wrapper from "../Wrapper";
import {
    IoAddOutline, IoChatbubblesOutline,
    IoCogOutline, IoCreateOutline,
    IoEllipsisHorizontal, IoPeopleOutline,
    IoTrashOutline
} from "react-icons/all";
import {Link} from "react-router-dom";
import {logout} from "../../store/authSlice";
import {SUPPORT_URL} from "../../store/utils/config";
import {copyInviteLink} from "../../store/utils/utils";
import {CircularProgress, Collapse, Fade, Menu, MenuItem, Tooltip} from "@mui/material";
import {TransitionGroup} from "react-transition-group";

interface Props {
    spaces: Space[]
    logout: () => void
    requestSpaces: () => void
    invite: (s: string) => void
    deleteSpaceForUser: (id: string) => void
}

interface State {
    mouseX?: number
    mouseY?: number
    space?: Space
}

export class Spaces extends Component<Props, State> {

    anchorRef: React.RefObject<HTMLButtonElement>
    requestInterval: number

    constructor(props: Props) {
        super(props);

        this.requestInterval = -1
        this.anchorRef = React.createRef()

        this.state = {}
    }

    componentDidMount() {
        this.props.requestSpaces()
        this.requestInterval = setInterval(() => this.props.requestSpaces(), 2000)
    }

    componentWillUnmount() {
        clearInterval(this.requestInterval)
        this.requestInterval = -1
    }

    handleContext(e: React.MouseEvent, space: Space) {
        e.preventDefault()
        e.stopPropagation()
        this.setState({
            mouseX: e.clientX,
            mouseY: e.clientY,
            space: space
        })
    }

    handleClose() {
        this.setState({
            mouseX: undefined,
            mouseY: undefined,
            space: undefined
        })
    }

    invite(e: React.MouseEvent, spaceID: string) {
        e.preventDefault()
        e.stopPropagation()
        this.props.invite(spaceID)
    }

    render() {
        return (
            <Wrapper className="spaces">
                <div className={"headlineBox"}>
                    <div>
                        <div className={"nav-buttons"}>
                            <Link to={"/create-space"}>
                                <button className={"outlined spaceRight"}>
                                    <IoAddOutline/> add space
                                </button>
                            </Link>
                            <Link to={"/settings/"}>
                                <button className={"outlined spaceRight"}>
                                    <IoCogOutline/> settings
                                </button>
                            </Link>
                            <a href={SUPPORT_URL}>
                                <button className={"outlined"}>
                                    <IoPeopleOutline/> Support
                                </button>
                            </a>
                        </div>
                        <h1>
                            Spaces <IoChatbubblesOutline/>
                        </h1>
                    </div>
                    <p>
                        To join a space, select a space on the right, or create a new one.<br/>
                        Invite your team to a space to collaborate.{" "}
                    </p>
                </div>
                <div className={"spacesWrapper"}>

                    <div className={"itemWrapper"}>
                        {this.props.spaces.length === 0 &&
                        <CircularProgress className={"loadingAnimation"} color={"inherit"}/>}
                        <TransitionGroup>

                            {this.props.spaces.map((s, idx) => (
                                <Collapse key={s.id}>

                                    <Link to={`/spaces/${s.id}`} key={idx}>
                                        <div
                                            onContextMenu={e =>
                                                this.handleContext(e, s)
                                            }
                                            className={"item " + ((idx > 0) ? "separator" : "")}>
                                            {s.name}
                                            <Fade in={!!s.online && s.online !== 0} key={s.online} unmountOnExit>
                                                <span className={"tag"}>{s.online} online</span>
                                            </Fade>
                                            <div className={"buttons"}>
                                                <button onClick={e => this.handleContext(e, s)}
                                                        className={"nostyle outlined"}>
                                                    <IoEllipsisHorizontal/>
                                                </button>
                                                <Tooltip title={"Copy invite link"} arrow placement={"top"}>
                                                    <button
                                                        onClick={e => this.invite(e, s.id)}
                                                        className={"outlined spaceRight"}>
                                                        Invite
                                                    </button>
                                                </Tooltip>
                                                <button>
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </Collapse>
                            ))}
                        </TransitionGroup>
                    </div>
                    <Link to={"/create-space"}>
                        <button
                            style={{
                                marginLeft: "3rem",
                                paddingTop: "0.5rem",
                                borderRadius: "0"
                            }}
                            className={"nostyle outlined spaceTop"}>
                            <IoAddOutline/> add space
                        </button>
                    </Link>
                    <Menu
                        keepMounted
                        onContextMenu={e => {
                            e.preventDefault()
                            this.handleClose()
                        }}
                        open={!!this.state.space}
                        onClose={this.handleClose.bind(this)}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            !!this.state.mouseY && !!this.state.mouseX
                                ? {top: this.state.mouseY, left: this.state.mouseX}
                                : undefined
                        }
                    >
                        {!!this.state.space && !this.state.space.public &&
                            <MenuItem
                                className={"menuItem"}
                                onClick={() => {
                                    this.handleClose()
                                    this.props.deleteSpaceForUser(this.state.space!.id)
                                }}>
                                <IoTrashOutline/> Delete
                            </MenuItem>
                        }
                        <MenuItem onClick={() => {
                            alert("This feature is not available yet.")
                            this.handleClose()
                        }}><IoCreateOutline/> Rename</MenuItem>
                    </Menu>
                </div>
            </Wrapper>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    spaces: state.space.spaces,
})

const mapDispatchToProps = (dispatch: any) => ({
    requestSpaces: () => dispatch(requestSpaces()),
    logout: () => dispatch(logout()),
    deleteSpaceForUser: (id: string) => dispatch(deleteSpaceForUser(id)),
    invite: (s: string) => dispatch(copyInviteLink(s)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Spaces)
