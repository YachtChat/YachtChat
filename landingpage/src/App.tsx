import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Videocontainer from "./components/Videocontainer/Videocontainer";
import Informationcontainer from "./components/Informationcontainer/Informationcontainer";
import Contactcontainer from "./components/Contactcontainer/Contactcontainer";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import Contact from "./components/Contact/Contact";
import Tutorial from "./components/Tutorial/Tutorial";
import Product from "./components/Product/Product";
import About from "./components/About/About";

function App() {
  return (
    <div className="App">
      <Router>
      <Header />
      <Videocontainer/>
      <Informationcontainer/>
      <Contactcontainer/>
      </Router>

    </div>
  );
}

export default App;
