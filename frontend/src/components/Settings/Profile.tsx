import {
    IoCreateOutline,
    IoLockClosedOutline,
    IoPowerOutline
} from "react-icons/all";
import React from "react";
import {RootState} from "../../store/utils/store";
import {connect} from "react-redux";
import {getUser} from "../../store/userSlice";
import {User} from "../../store/model/model";
import {logout} from "../../store/authSlice";

interface Props {
    user: User
    logout: () => void
}

export function Profile(props: Props) {
    return (
        <div className={"mediaSettings"}>
            <div className={"toggles"}>
                <div className={"settings-item"}>
                    <label>
                        User image
                    </label>
                    <img className={"userImage"} src={props.user.profile_image} alt={'Profile'}/>
                </div>
                <div className={"settings-item"}>
                    <label>
                        First Name
                    </label>
                    <input value={props.user.firstName} contentEditable={false} />
                    <label>
                        Last Name
                    </label>
                    <input value={props.user.lastName} contentEditable={false} />
                    <label>
                        Email
                    </label>
                    <input value={props.user.email}
                           contentEditable={false}/>
                </div>
                <div className={"settings-item"}>
                    <button className={"submit outlined"}
                            onClick={() => alert("This feature is not available yet")}>
                        <IoCreateOutline/> Edit Profile
                    </button>
                    <button className={"submit outlined"}
                            onClick={() => alert("This feature is not available yet")}>
                        <IoLockClosedOutline/> Change Password
                    </button>
                    <button className={"submit outlined logout"}
                            onClick={props.logout}>
                        <IoPowerOutline/> Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    user: getUser(state)
})

const mapDispatchToProps = (dispatch: any) => ({
    logout: () => dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)