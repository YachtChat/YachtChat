import React, {Component} from 'react';
import './App.scss';
import Playground from "./components/playground";
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

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
                    <Route exact path="/playground" component={Playground}/>
                </Switch>

            </Router>
        );
    }

}



export default App;
