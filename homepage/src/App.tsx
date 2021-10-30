import React from 'react';
import './App.css';
import Navigation from "./components/navigation";
import {ReactKeycloakProvider} from '@react-keycloak/web'
import {auth} from "./util/keycloak";
import {Landing} from "./components/landing";
import {About} from "./components/about";
import {Scenarios} from "./components/scenarios";
import {Tutorial} from "./components/tutorial";
import {Usp} from "./components/usp";
import {Contact} from "./components/contact";
import {ParallaxProvider} from "react-scroll-parallax";


function App() {
    return (
        <ReactKeycloakProvider authClient={auth} initOptions={{
            onLoad: "check-sso",
            silentCheckSsoRedirectUri: window.location.origin
        }}>
            <ParallaxProvider>

                <div className="App">
                    <Navigation/>
                    <Landing/>
                    <About/>
                    <Scenarios/>
                    <Usp/>
                    <Tutorial/>
                    <Contact/>
                </div>
            </ParallaxProvider>
        </ReactKeycloakProvider>
    );
}

export default App;
