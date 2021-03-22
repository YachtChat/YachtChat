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
import Scrollhandler from "./components/Scrollhandler/Scrollhandler";


function App() {
  return (
    <div className="App">

      <Header>
        <Scrollhandler/>
      </Header>




      <Videocontainer/>
      <Informationcontainer/>
      <Contactcontainer/>
        {/*<Switch>
            <Route exact path="/#contact" component={Contactcontainer}/>
            <Route exact path="/#about" component={About}/>
            <Route exact path="/#tutorial" component={Tutorial}/>
            <Route exact path="/#product" component={Product}/>
        </Switch>*/}



    </div>
  );
}

export default App;
