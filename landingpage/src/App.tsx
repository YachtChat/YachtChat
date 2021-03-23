import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Videocontainer from "./components/Videocontainer/Videocontainer";
import Informationcontainer from "./components/Informationcontainer/Informationcontainer";
import Contactcontainer from "./components/Contactcontainer/Contactcontainer";
import Product from "./components/Product/Product";
import Impressum from "./components/Impressum/Impressum";



function App() {
  return (
    <div className="App">





        <Header/>
        <Product/>
      <Videocontainer/>
      <Informationcontainer/>
      <Contactcontainer/>
      <Impressum/>




    </div>
  );
}

export default App;
