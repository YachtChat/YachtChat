import {RootState} from "../../../store/utils/store";
import {getScreenStream, getStream} from "../../../store/mediaSlice";
import {getUserID, getUserWrapped} from "../../../store/userSlice";
import React, {Component, createRef} from "react";
import {connect} from "react-redux";
import {UserWrapper} from "../../../store/model/UserWrapper";

interface Props {
    className?: string
    profile_image: string | undefined
    getStream: () => MediaStream | undefined
    user: UserWrapper
    getScreenStream: () => MediaStream | undefined
}

interface State {

}

class VideoIcon extends Component<Props, State> {
    protected stream: MediaStream | undefined
    protected video: React.RefObject<HTMLVideoElement>

    constructor(props: Props) {
        super(props);

        this.video = createRef()
    }

    componentDidMount() {
        if (this.video.current) {
            if (!this.video.current?.srcObject) {
                let stream: MediaStream | undefined
                if (this.props.user.screen) {
                    stream = this.props.getScreenStream()!
                } else {
                    stream = this.props.getStream()!
                }

                this.video.current.srcObject = stream!
                //console.log(this.props.getStream(this.props.user.id)!)
            }
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<Props>) {
        if (this.video.current) {
            if (!this.video.current?.srcObject ||
                this.props.user.userStream !== prevProps.user.userStream) {
                let stream: MediaStream | undefined
                if (this.props.user.screen) {
                    stream = this.props.getScreenStream()!
                } else {
                    stream = this.props.getStream()!
                }

                this.video.current.srcObject = stream!
                //console.log(this.props.getStream(this.props.user.id)!)
            }
        }
    }

    render() {
        return (
            <video
                className={this.props.className}
                style={{
                    backgroundSize: "contain",
                    backgroundImage:
                        ((!this.props.user.screen && !this.props.user.video) || !this.video.current?.srcObject) ?
                            `url(${this.props.profile_image})` : "none",
                }}
                autoPlay muted ref={this.video}/>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user: getUserWrapped(state),
    profile_image: state.userState.activeUser.profile_image,
    getStream: () => getStream(state, getUserID(state)),
    getScreenStream: () => getScreenStream(state, getUserID(state)),
})

const mapDispatchToProps = (dispatch: any) => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(VideoIcon);