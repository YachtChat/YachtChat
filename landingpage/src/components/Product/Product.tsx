import React from 'react';
import './Product.scss';
import {Card} from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const Product: React.FC = () => (
  <div id={`product`} className="product-container">
      <Card className="product-card">
          <CardMedia
              className="media"
              image={
                  "https://cdn.pixabay.com/photo/2017/10/10/21/49/youtuber-2838945_960_720.jpg"
              }

          />
          <CardContent className="content">
              <Typography
                  className={"MuiTypography--heading"}
                  variant={"h6"}
                  gutterBottom
              >
                  Just a little longer...
              </Typography>
              <Typography
                  className={"MuiTypography--subheading"}
                  variant={"caption"}
              >
                  Hello friend,

                  sorry to keep you waiting!

                  Our team is working hard on our alpha.
                  While you're waiting for your new communication tool - take a look around our website!

                  See you soon,

                  Team Alphabibber
              </Typography>
              <Divider className="divider" light />
          </CardContent>
      </Card>
  </div>

);

export default Product;
