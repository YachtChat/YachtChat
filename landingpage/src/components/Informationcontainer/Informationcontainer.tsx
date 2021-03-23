import React from 'react';
import './Informationcontainer.scss';
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const Informationcontainer: React.FC = () => (
  <div id={`about`} className="Informationcontainer">
      <Card className="card">
          <CardMedia
              className="media"
              image={
                  "https://image.freepik.com/free-photo/river-foggy-mountains-landscape_1204-511.jpg"
              }

          />
          <CardContent className="content">
              <Typography
                  className={"MuiTypography--heading"}
                  variant={"h6"}
                  gutterBottom
              >
                  Redefining mobility through communication
              </Typography>
              <Typography
                  className={"MuiTypography--subheading"}
                  variant={"caption"}
              >
                  NotZoom connects, socializes and amplifies productivity.  Your home office transforms into a place of collaboration.
                  Especially in these times, digital communication tools are needed like never before. Making this communication as intuitive and accessible as possible is our mission.
                  We enable a new experience of digital communication.
              </Typography>
              <Divider className="divider" light />
          </CardContent>
      </Card>
  </div>
);

export default Informationcontainer;
