import React, {Component} from 'react';
import './Header.scss';
import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button, Link,
} from "@material-ui/core";

import {BrowserRouter as Router, Link as RouterLink, Route, Switch, withRouter} from "react-router-dom";
import { useHistory } from "react-router-dom";
import Contact from "../Contact/Contact";
import About from "../About/About";
import Tutorial from "../Tutorial/Tutorial";
import Product from "../Product/Product";




const Header = () => {
    const history = useHistory();
    function changeUrl(label: string) {
        history.push(`/${label}`);
    }




     const getMenuButtons = () => {


        return headersData.map(({label, href}) => {
            return <Button
                 // hier muss noch iteriert werden über die labels und je nach labels abgefragt werden
                {...{
                    key: label,
                    color: "inherit",
                    to: href,
                    component: Link
                }}
                onClick={() => changeUrl(label.toLowerCase())}
            >
                {label}
            </Button>;
        });
    };


   const displayDesktop = () => {
        return (

            <Toolbar className="ToolBar">{notzoomLogo} {getMenuButtons()}</Toolbar>


        );
    };



   const headersData = [
        {
            label: "Contact",
            href: "/contact",
        },
        {
            label: "Tutorial",
            href: "/tutorial",
        },
        {
            label: "About",
            href: "/about",
        },
        {
            label: "Product",
            href: "/product",
        },
    ];


   const notzoomLogo = (
        <Typography variant="h6" component="h1" className="Logo">
            NotZoom
        </Typography>
    );



    return(
        <>
            <AppBar className="Header"> {
                displayDesktop()
            }


            </AppBar>

            <Switch>
                <Route exact path="/contact" component={Contact}/>
                <Route exact path="/about" component={About}/>
                <Route exact path="/tutorial" component={Tutorial}/>
                <Route exact path="/product" component={Product}/>
            </Switch>
        </>

    );


}

export default Header;
