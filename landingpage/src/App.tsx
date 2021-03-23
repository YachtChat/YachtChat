import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Videocontainer from "./components/Videocontainer/Videocontainer";
import Informationcontainer from "./components/Informationcontainer/Informationcontainer";
import Contactcontainer from "./components/Contactcontainer/Contactcontainer";
import Product from "./components/Product/Product";



function App() {
  return (
    <div className="App">





        <Header/>
        <Product/>
      <Videocontainer/>
      <Informationcontainer/>
      <Contactcontainer/>




    </div>
  );
}

export default App;
