import React, {Component} from 'react';
import './Contactcontainer.scss';
import axios from "axios";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import {Button, Icon} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {render} from "react-dom";






const Contactcontainer = () => {

const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            button: {
                margin: theme.spacing(1),
            },
        }),
    );

   const classes = useStyles;



   function sendMail(){
        const mailto: string =
            "mailto:maxmustermann@alphabibber.com"
        window.location.href=mailto;
    }



       return (
            <div id={`contact`} className="Contactcontainer">
                <Card className="card">
                    <CardMedia
                        className="media"
                        image={
                            "https://media.istockphoto.com/photos/email-marketing-concept-picture-id1018925188?k=6&m=1018925188&s=612x612&w=0&h=O5czBVGY8HwndNMELhuTWPvQJTj7o8hNjaEeSRoHDjo="
                        }

                    />
                    <CardContent className="content">
                        <Typography
                            className={"MuiTypography--heading"}
                            variant={"h6"}
                            gutterBottom
                        >
                            Leave your number here... or send us an email
                        </Typography>
                        <Typography
                            className={"MuiTypography--subheading"}
                            variant={"caption"}
                        >
                            Do you have any questions regarding our product?
                            Do not hesitate to reach out to us!
                        </Typography>
                        <Divider className="divider" light />
                            <Button variant="contained"
                                    color="primary"
                                    className={classes().button}
                                    onClick={() => sendMail()}>

                            Send</Button>
                    </CardContent>
                </Card>
            </div>
        );


}

export default Contactcontainer;
