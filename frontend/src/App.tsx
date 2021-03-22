import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/Playground";
import Login from "./components/Login/Login";
import {RootState} from "./store/store";
import {connect} from "react-redux";
import Landingpage from "./components/Landingpage/Landingpage";
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom';

interface State{
    isUserAuthenticated: boolean
}
interface Props{}

export class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state ={
            isUserAuthenticated: false
        };
    }

    render() {
        return (
            <Router>

                <Switch>
                    <Route exact path="/">
                        <Redirect to="/landingpage"/>
                    </Route>
                    <Route exact path = "/landingpage" component={Landingpage}/>
                    <Route exact path="/playground" component={Playground}/>
                </Switch>

            </Router>
        );
    }

}



export default App;
