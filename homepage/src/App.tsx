import React, { useEffect } from 'react';
import './App.css';
import Navigation from "./components/navigation";
import { Landing } from "./components/landing";
import { About } from "./components/about";
import { Scenarios } from "./components/scenarios";
import { Tutorial } from "./components/tutorial";
import { Usp } from "./components/usp";
import { Contact } from "./components/contact";
import { ParallaxProvider } from "react-scroll-parallax";
import posthog from 'posthog-js';
import { Routes, Route } from "react-router-dom"
import { Privacy } from "./components/imprint/Privacy";
import { Terms } from "./components/imprint/Terms";
import { Imprint } from "./components/imprint/Imprint";
import { Footer } from "./components/Footer";
import ReactGA from 'react-ga4';

ReactGA.initialize('G-PPGBPL23GC');

function App() {
    if (!window.location.href.includes('localhost')) {
        posthog.init("phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC", { api_host: 'https://posthog.yacht.chat' });
    }

    useEffect(() => {   
        ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search, title: "Yacht.Chat" });
    }, []) 

    return (
        <ParallaxProvider>
            <div className="App" id="App">
                <Navigation />
                <Routes>
                    <Route path={"/privacy"} element={<Privacy />} />
                    <Route path={"/terms"} element={<Terms />} />
                    <Route path={"/imprint"} element={<Imprint />} />
                    <Route path={"/"} element={
                        <div>
                            <Landing />
                            <About />
                            <Usp />
                            <Tutorial />
                            <Scenarios />
                            <Contact />
                        </div>
                    } />
                </Routes>
                <Footer />
            </div>
        </ParallaxProvider>
    );
}

export default App;

