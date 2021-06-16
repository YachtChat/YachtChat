import React, {Component} from "react";
import './style.scss';
import * as typeformEmbed from "@typeform/embed";
import { ReactTypeformEmbed } from 'react-typeform-embed';

interface Props {

}

export class Typeform extends Component<Props>{


    render() {
        return (
            <div>
                <ReactTypeformEmbed url ="https://5pj03571xzw.typeform.com/to/R5rBRKpT" popup={true} hideHeaders={true} hideFooter={true} buttonText={"Feedback"} ></ReactTypeformEmbed>
            </div>
        );
    }

}
