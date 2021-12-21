import {IoChevronDownOutline, IoPeople} from "react-icons/all";
import {ClickAwayListener, Grow, MenuList, Paper, Popper} from "@material-ui/core";
import {Link} from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import {FaCog, FaPowerOff} from "react-icons/fa";
import React, {Component, createRef} from "react";
import {User} from "../../../store/models";
import {RootState} from "../../../store/store";
import {logout} from "../../../store/authSlice";
import {connect} from "react-redux";

interface Props {
    activeUser: User
    logout: () => void
}

interface State {
    profileOpen: boolean
    mouseX?: number
    mouseY?: number
}

export class AuthButtons extends Component<Props, State> {

    private anchorRef: React.RefObject<HTMLButtonElement>

    constructor(props: Props) {
        super(props);

        this.anchorRef = createRef()

        this.state = {
            profileOpen: false
        }
    }

    handleClose() {
        this.setState({
            profileOpen: false,
            mouseX: undefined,
            mouseY: undefined,
        })
    }

    render() {
        const open = this.state.profileOpen

        return (
            <div className={"authentification"}>
                <div>
                    <button
                        className={"iconButton profilePic"}
                        ref={this.anchorRef}
                        onMouseOver={() => this.setState({profileOpen: true})}
                        onMouseLeave={() => this.setState({profileOpen: false})}
                        style={{backgroundImage: `url(${this.props.activeUser.profile_image})`}}
                    />
                    <IoChevronDownOutline />
                </div>
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
                                        <Link to={""}>
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
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    activeUser: state.userState.activeUser,
})

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => dispatch(logout()),
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthButtons)