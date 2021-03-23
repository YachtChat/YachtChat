import React, {Component} from 'react';
import './Header.scss';
import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button, Link, Card,
} from "@material-ui/core";


import {useHistory} from "react-router-dom";

import About from "../About/About";

import Product from "../Product/Product";



const Header = () => {
    const history = useHistory();

    function changeUrl(label: string) {
        history.push(`/${label}`);

        const section = document.getElementById(`${label!}`)
        console.log(section)
        if (section)
            section.scrollIntoView({behavior: "smooth", block: "start"})
    }


    const getMenuButtons = () => {


        return headersData.map(({label, href}) => {
            return <Button

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
            label: "Product",
            href: "/product",
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
            label: "Contact",
            href: "/contact",
        },
    ];


    const notzoomLogo = (
        <Typography variant="h6" component="h1" className="Logo">
            NotZoom
        </Typography>
    );


    return (

            <AppBar className="Header"> {
                displayDesktop()
            }


            </AppBar>





    );


}

export default Header;
