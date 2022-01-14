import Keycloak from 'keycloak-js'
import {AUTH_SERVICE, CLIENT_ID, REALM} from "./config";

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
    url: AUTH_SERVICE?.includes('localhost') ? 'http://' + AUTH_SERVICE + '/auth' : 'https://' + AUTH_SERVICE + '/auth',
    realm: REALM ? REALM : '',
    clientId: CLIENT_ID ? CLIENT_ID : ''
})
export default keycloak
