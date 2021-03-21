import React from 'react';
import './Header.scss';
import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button,
} from "@material-ui/core";

import {Link as RouterLink} from "react-router-dom";

const displayDesktop = () => {
    return <Toolbar className="ToolBar">{notzoomLogo} {getMenuButtons()}</Toolbar>;
};

const getMenuButtons = () => {
    return headersData.map(({label, href}) => {
        return (
            <Button className="MenuButton"
                    {...{
                        key: label,
                        color: "inherit",
                        to: href,
                        component: RouterLink,
                    }}
            >
                {label}
            </Button>
        );
    });
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


const Header: React.FC = () => (
    <AppBar className="Header">{displayDesktop()}</AppBar>
);

export default Header;
