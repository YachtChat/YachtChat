import React, {Component} from "react";
import Wrapper from "../Wrapper";
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {connect} from "react-redux";
import {createSpace} from "../../store/spaceSlice";
import {handleError} from "../../store/statusSlice";
import {Steps} from "./Steps";

interface Props {
    createSpace: (name: string) => void
    error: (s: string) => void
}

interface State {
    spaceName: string
}

export class CreateSpace extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            spaceName: ""
        }
    }

    render() {
        return (
            <Wrapper className={"create spaces"}>
                <div className={"headlineBox"}>
                    <Link to={"/spaces"}>
                        <button className={"outlined"}><FaChevronLeft/> back to spaces</button>
                    </Link>
                    <h1>
                        Create a space
                    </h1>
                    A space is a private location where you can meet with every member of a space.
                </div>
                <form className={"spacesWrapper"} onSubmit={e => {
                        e.preventDefault()
                        if (this.state.spaceName.trim() === "") {
                            this.props.error("The name is not valid")
                            return
                        }
                        this.props.createSpace(this.state.spaceName.trim())
                }}>
                    <Steps active={0} />
                    <input value={this.state.spaceName}
                           placeholder={"space name"}
                           onChange={({target: {value}}) => this.setState({spaceName: value})} type={"text"}/>
                    <input type={"submit"} title={"Create Space"} />
                </form>
            </Wrapper>
        );
    }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch: any) => ({
    createSpace: (name: string) => dispatch(createSpace(name)),
    error: (s: string) => dispatch(handleError(s))
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateSpace)