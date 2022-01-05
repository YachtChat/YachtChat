import React, {Component} from "react";
import './style.scss';
import {Space} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {deleteSpaceForUser, getInvitationToken, requestSpaces} from "../../store/spaceSlice";
import Wrapper from "../Wrapper";
import {
    IoAddOutline, IoArrowForward, IoChatbubblesOutline,
    IoCogOutline, IoCreateOutline,
    IoEllipsisHorizontal, IoPeopleOutline,
    IoTrashOutline
} from "react-icons/all";
import {Link} from "react-router-dom";
import {logout} from "../../store/authSlice";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {Tooltip} from "@material-ui/core";
import {FRONTEND_URL, SUPPORT_URL} from "../../store/config";
import {handleError, handleSuccess} from "../../store/statusSlice";

interface Props {
    spaces: Space[]
    logout: () => void
    requestSpaces: () => void
    success: (s: string) => void
    error: (s: string) => void
    getToken: (spaceID: string) => Promise<string>
    deleteSpaceForUser: (id: string) => void
}

interface State {
    mouseX?: number
    mouseY?: number
    space?: Space
}

export class Spaces extends Component<Props, State> {

    anchorRef: React.RefObject<HTMLButtonElement>

    constructor(props: Props) {
        super(props);

        this.anchorRef = React.createRef()

        this.state = {}
    }

    componentDidMount() {
        this.props.requestSpaces()
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
        this.props.getToken(spaceID!).then(token => {
            navigator.clipboard.writeText("https://" + FRONTEND_URL + "/join/" + token)
            this.props.success("Invite link copied")
        }).catch(() => this.props.error("Unable to request token"))
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
                        {this.props.spaces.map((s, idx) => (
                            <Link to={`/spaces/${s.id}`} key={idx}>
                                <div
                                    onContextMenu={e =>
                                        this.handleContext(e, s)
                                    }
                                    className={"item " + ((idx > 0) ? "separator" : "")}>
                                    {s.name}
                                    {(!!s.online && s.online !== 0) && (
                                        <span className={"tag"}>{s.online} online</span>
                                    )}
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
                        ))}
                    </div>
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
                <footer>
                    <Link to={"/create-space"}>
                        <button className={"outlined spaceRight"}>
                            <IoAddOutline/> add space
                        </button>
                    </Link>
                    <a href={SUPPORT_URL}>
                        <button className={"outlined spaceRight"}>
                            <IoPeopleOutline /> Support
                        </button>
                    </a>
                    <Link to={"/settings"}>
                        <button className={"outlined spaceRight"}>
                            <IoCogOutline /> Settings
                        </button>
                    </Link>
                </footer>
            </Wrapper>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    spaces: state.space.spaces,
    getToken: (spaceID: string) => getInvitationToken(state, spaceID),
})

const mapDispatchToProps = (dispatch: any) => ({
    requestSpaces: () => dispatch(requestSpaces()),
    logout: () => dispatch(logout()),
    success: (s: string) => dispatch(handleSuccess(s)),
    error: (s: string) => dispatch(handleError(s)),
    deleteSpaceForUser: (id: string) => dispatch(deleteSpaceForUser(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Spaces)
