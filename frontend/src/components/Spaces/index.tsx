import React, {Component} from "react";
import './style.scss';
import {Space, User} from "../../store/models";
import {connect} from "react-redux";
import {RootState} from "../../store/store";
import {deleteSpaceForUser, requestSpaces} from "../../store/spaceSlice";
import Wrapper from "../Wrapper";
import {IoAddOutline, IoChevronForwardOutline, IoEllipsisHorizontal, IoPeople, IoTrashOutline} from "react-icons/all";
import {Link} from "react-router-dom";
import {FaCog, FaPowerOff} from "react-icons/fa";
import {logout} from "../../store/authSlice";
import keycloak from "../../store/keycloak";
import {ClickAwayListener, Grow, MenuList, Paper, Popper} from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

interface Props {
    activeUser: User
    spaces: Space[]
    logout: () => void
    requestSpaces: () => void
    deleteSpaceForUser: (id: string) => void
}

interface State {
    profileOpen: boolean
    mouseX?: number
    mouseY?: number
    space?: Space
}

export class Spaces extends Component<Props, State> {

    anchorRef: React.RefObject<HTMLButtonElement>

    constructor(props: Props) {
        super(props);

        this.anchorRef = React.createRef()

        this.state = {
            profileOpen: false,
        }
    }

    componentDidMount() {
        this.props.requestSpaces()
    }

    handleClose() {
        this.setState({
            profileOpen: false,
            mouseX: undefined,
            mouseY: undefined,
            space: undefined
        })
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

    render() {
        const open = this.state.profileOpen
        return (
            <Wrapper className="spaces">
                <div className={"headlineBox"}>
                    <div className={"buttons"}>
                        <button
                            className={"iconButton profilePic"}
                            ref={this.anchorRef}
                            onMouseOver={() => this.setState({profileOpen: true})}
                            onMouseLeave={() => this.setState({profileOpen: false})}
                            style={{backgroundImage: `url(${this.props.activeUser.profile_image})`}}
                        />
                        <Popper open={open}
                                anchorEl={this.anchorRef.current}
                                role={undefined} placement={"bottom"}
                                onMouseOver={() => this.setState({profileOpen: true})}
                                onMouseLeave={() => this.setState({profileOpen: false})}
                                transition disablePortal>
                            {({TransitionProps, placement}) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{transformOrigin: placement === 'bottom' ? 'top' : 'top'}}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={this.handleClose.bind(this)}>
                                            <MenuList autoFocusItem={open} id="menu-list-grow">
                                                <Link to={keycloak.createAccountUrl()}>
                                                    <MenuItem className={"menuItem"}
                                                              onClick={this.handleClose.bind(this)}>
                                                        <FaCog/> Account
                                                    </MenuItem>
                                                </Link>
                                                <Link to={"/friends"}>
                                                    <MenuItem className={"menuItem"}
                                                              onClick={this.handleClose.bind(this)}><IoPeople/> Friends</MenuItem>
                                                </Link>
                                                <MenuItem onClick={this.props.logout}><FaPowerOff/> Logout</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </div>
                    <h1>Hello, {this.props.activeUser.firstName}</h1>
                    <p>To join a space, select a space on the right, or create a new one.</p>
                </div>
                <div className={"spacesContent"}>

                    <h2>Spaces
                        <Link to={"/create-space"}>
                            <span className={"minimalButton"}>
                            <IoAddOutline/>
                            </span>
                        </Link>
                    </h2>
                    <div className={"itemWrapper"}>
                        {this.props.spaces.map((s, idx) => (
                            <Link to={`/spaces/${s.id}`} key={idx}>
                                <div
                                    onContextMenu={e =>
                                        this.handleContext(e, s)
                                    }
                                    className={"item " + ((idx > 0) ? "separator" : "")}>
                                    {s.name}
                                    <div className={"buttons"}>
                                        <button onClick={e => this.handleContext(e, s)}
                                                className={"menuIcon"}>
                                            <IoEllipsisHorizontal/>
                                        </button>
                                        <IoChevronForwardOutline/>
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
                        <Link to={"/invite/" + this.state.space?.id}>
                            <MenuItem onClick={this.handleClose.bind(this)}>Invite</MenuItem>
                        </Link>
                    </Menu>
                </div>
            </Wrapper>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
    spaces: state.space.spaces,
})

const mapDispatchToProps = (dispatch: any) => ({
    requestSpaces: () => dispatch(requestSpaces()),
    logout: () => dispatch(logout()),
    deleteSpaceForUser: (id: string) => dispatch(deleteSpaceForUser(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Spaces)
