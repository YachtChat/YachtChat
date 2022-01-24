import {IoCameraOutline, IoChevronDownOutline, IoCogOutline, IoPersonOutline, IoPowerOutline,} from "react-icons/all";
import React, {Component, createRef} from "react";
import {User} from "../../store/model/model";
import {RootState} from "../../store/utils/store";
import {logout} from "../../store/authSlice";
import {connect} from "react-redux";
import {sendLogout} from "../../store/webSocketSlice";
import {push} from "connected-react-router";
import {ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper} from "@mui/material";

interface OwnProps {
    minimal?: boolean
    spaceID?: string
}

interface OtherProps {
    activeUser: User
    logout: () => void
    logoutOfSpace: (s: string) => void
}

type Props = OwnProps & OtherProps

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
                        onClick={this.handleClose.bind(this)}
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
                                        <MenuItem className={"menuItem"}
                                                  onClick={() => this.props.logoutOfSpace("/settings/")}>
                                            <span><IoCogOutline/> Settings</span>
                                        </MenuItem>
                                        <MenuItem className={"menuItem"}
                                                  onClick={() => this.props.logoutOfSpace("/settings/media")}>
                                            <span><IoCameraOutline/> Media Settings</span>
                                        </MenuItem>
                                        <MenuItem className={"menuItem"}
                                                  onClick={() => this.props.logoutOfSpace("/settings/profile")}>
                                            <span><IoPersonOutline/> Profile</span>
                                        </MenuItem>
                                        <MenuItem onClick={this.props.logout}><span
                                            style={{color: "red"}}><IoPowerOutline/> Logout</span></MenuItem>
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

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) => ({
    logout: () => dispatch(logout()),
    logoutOfSpace: (s: string) => {
        if (!ownProps.spaceID || window.confirm("Are you sure to leave this space").valueOf()) {
            dispatch(sendLogout(false))
            dispatch(push(s))
        }
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthButtons)