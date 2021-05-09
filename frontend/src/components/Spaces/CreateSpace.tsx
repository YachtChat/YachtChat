import React, {Component} from "react";
import Wrapper from "../Wrapper";
import {Link} from "react-router-dom";
import {FaChevronLeft} from "react-icons/fa";
import {IoPeopleOutline} from "react-icons/all";
import {connect} from "react-redux";
import {createSpace} from "../../store/spaceSlice";

interface Props {
    createSpace: (name: string) => void
}

interface State {
    spaceName: string
}

export class CreateSpace extends Component<Props, State> {

    render() {
        return (
            <Wrapper className={"spaces"}>
                <div className={"headlineBox"}>
                    <div className={"buttons"}>
                        <Link to={"/spaces"}>
                            <button className={"iconButton"}><FaChevronLeft/></button>
                        </Link>
                    </div>

                    <h1><IoPeopleOutline/></h1>
                    <h1>Create a space</h1>
                    <p>A space is a private location where you can meet with every member of a space.</p>
                </div>
                <form>
                    <input value={this.state.spaceName}
                           onChange={({target: {value}}) => this.setState({spaceName: value})} type={"text"}/>
                    <Link to={"/spaces"}>
                        <button onClick={() => this.props.createSpace(this.state.spaceName)}>
                            Create Space
                        </button>
                    </Link>
                </form>
            </Wrapper>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => ({
    createSpace: (name: string) => dispatch(createSpace(name))
})

export default connect(mapDispatchToProps)(CreateSpace)