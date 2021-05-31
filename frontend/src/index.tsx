import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import {history, store} from './store/store';
import {Provider} from 'react-redux';
import * as serviceWorker from './serviceWorker';
import "webrtc-adapter";
import {ConnectedRouter} from "connected-react-router";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <App/>
            </ConnectedRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
