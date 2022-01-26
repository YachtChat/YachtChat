import Wrapper from "../../Wrapper";
import {IoMoon, IoMoonOutline} from "react-icons/io5";
import React from "react";
import {connect} from "react-redux";
import {RootState} from "../../../store/utils/store";
import {toggleDoNotDisturb} from "../../../store/mediaSlice";

interface Props {
    toggleDnd: () => void
}

function DoNotDisturb(props: Props) {
    return (
        <Wrapper className={""}>
            <div className={"headlineBox"}>
                <div className={"nav-buttons"}>
                    <button onClick={props.toggleDnd} className={"outlined spaceRight"}>
                        <IoMoonOutline/> deactivate do not disturb
                    </button>
                </div>
                <h1>
                    <IoMoon /><br />
                    Do not disturb
                </h1>
                <p>
                    You do not hear anybody when this mode is activated. <br />
                    While active you are not beeing heard or seen by anybody. <br />
                    This is the optimal mode when in other calls or important talks.
                </p>
            </div>
            <div className={"content"}>
                <button onClick={props.toggleDnd} className={"submit"}>
                    Disable do not disturb
                </button>
            </div>
        </Wrapper>
    )
}

const mapStateToProps = (state: RootState) => ({

})

const mapDispatchToProps = (dispatch: any) => ({
    toggleDnd: () => dispatch(toggleDoNotDisturb()),
})

export default connect(mapStateToProps, mapDispatchToProps)(DoNotDisturb)