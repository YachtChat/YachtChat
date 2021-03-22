import React, {Component} from 'react';
import './Videocontainer.scss';
import theVideo from "./demo.mp4";



export class Videocontainer extends Component {
    render() {
        return(
            <video autoPlay playsInline loop muted height="1000" width="1000">
                <source src={theVideo}/>
            </video>
        );
    }





}

export default Videocontainer;
