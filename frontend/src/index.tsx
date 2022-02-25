import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import {history, store} from './store/utils/store';
import {Provider} from 'react-redux';
import * as serviceWorker from './serviceWorker';
import "webrtc-adapter";
import { HistoryRouter as Router } from "redux-first-history/rr6";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router history={history}>
                <App/>
            </Router>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
