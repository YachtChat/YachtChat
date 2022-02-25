import {useParams} from "react-router-dom";
import {ConnectedComponent} from "react-redux";

interface Props {
    Component: ConnectedComponent<any, any>
}

export function ParamsPass(props: Props) {

    return <props.Component params={useParams()} />
}