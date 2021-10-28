import Keycloak from "keycloak-js";
import {FRONTEND_URL} from "./config";

export const auth = Keycloak();

{
    // url: AUTH_SERVICE?.includes('localhost') ? 'http://' + AUTH_SERVICE + '/auth' : 'https://' + AUTH_SERVICE + '/auth',
    // realm: REALM ? REALM : '',
    // clientId: CLIENT_ID ? CLIENT_ID : ''
}

export const login = () => {
    auth.login({
        redirectUri: FRONTEND_URL
    })
}