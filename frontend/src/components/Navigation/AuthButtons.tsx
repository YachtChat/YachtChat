import {IoChevronDownOutline, IoCogOutline, IoPowerOutline,} from "react-icons/all";
import {ClickAwayListener, Grow, MenuList, Paper, Popper} from "@material-ui/core";
import {Link} from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import React, {Component, createRef} from "react";
import {User} from "../../store/models";
import {RootState} from "../../store/store";
import {logout} from "../../store/authSlice";
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";

interface Props {
    minimal?: boolean
    activeUser: User
    logout: () => void
    logoutOfSpace: () => void
}

interface State {
    profileOpen: boolean
    mouseX?: number
    mouseY?: number
}

export class AuthButtons extends Component<Props, State> {

    private anchorRef: React.RefObject<HTMLDivElement>

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
        const open = this.state.profileOpen && !this.props.minimal

        return (
            <div className={"authentification"}
                 onMouseOver={() => this.setState({profileOpen: true})}
                 onMouseLeave={() => this.setState({profileOpen: false})}
                 ref={this.anchorRef}>
                <span>
                    {this.props.activeUser.firstName + " "}
                    {this.props.activeUser.lastName}
                </span>
                <button
                    className={"iconButton profilePic"}
                    style={{backgroundImage: `url(${this.props.activeUser.profile_image})`}}
                />
                {!this.props.minimal &&
                <IoChevronDownOutline className={"icon"}/>
                }
                <Popper open={open}
                        anchorEl={this.anchorRef.current}
                        role={undefined} placement={"bottom"}
                        onMouseOver={() => this.setState({profileOpen: true})}
                        onMouseLeave={() => this.setState({profileOpen: false})}
                        onClick={this.props.logoutOfSpace}
                        transition disablePortal>
                    {({TransitionProps, placement}) => (
                        <Grow
                            {...TransitionProps}
                            style={{transformOrigin: placement === 'bottom' ? 'top' : 'top'}}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={this.handleClose.bind(this)}>
                                    <MenuList autoFocusItem={open} id="menu-list-grow">
                                        {/*<Link to={""}>*/}
                                        {/*    <MenuItem className={"menuItem"}*/}
                                        {/*              onClick={this.handleClose.bind(this)}>*/}
                                        {/*        <FaCog/> Account*/}
                                        {/*    </MenuItem>*/}
                                        {/*</Link>*/}
                                        <Link to={"/settings/"}>
                                            <MenuItem className={"menuItem"}
                                                      onClick={this.handleClose.bind(this)}><IoCogOutline/> Settings</MenuItem>
                                        </Link>
                                        <MenuItem onClick={this.props.logout}><IoPowerOutline/> Logout</MenuItem>
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
    logoutOfSpace: () => dispatch(sendLogout(false)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthButtons)