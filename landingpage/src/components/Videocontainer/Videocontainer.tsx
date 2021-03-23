import React, {Component} from 'react';
import './Videocontainer.scss';
import theVideo from "./demo.mp4";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";



export class Videocontainer extends Component {
    render() {
        return(
          <div className="video-container">
              <Card className="video-card">


            <video  id={`tutorial`} autoPlay playsInline loop muted height="1000" width="1000">
                <source src={theVideo}/>
            </video>
              </Card>
          </div>
        );
    }





}

export default Videocontainer;
