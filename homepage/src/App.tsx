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


function App() {
    return (
        <ReactKeycloakProvider authClient={auth} initOptions={{onLoad: "check-sso"}}>

            <div className="App">
                <Navigation/>
                <Landing/>
                <About/>
                <Scenarios/>
                <Usp/>
                <Tutorial/>
            </div>
        </ReactKeycloakProvider>
    );
}

export default App;
