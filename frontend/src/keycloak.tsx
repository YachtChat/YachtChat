import Keycloak from 'keycloak-js'

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
    url:'', // Kommt von Marc und Danilo
    realm: 'Test', // Kommt von Marc und Danilo
    clientId:'react-test' // Kommt von Marc und Danilo
})
export default keycloak
