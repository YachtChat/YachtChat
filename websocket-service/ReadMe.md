# Websocket for NotZoom

### Run the Websocket Server
The server expects some env variables that should look like this:
`SPACES_URL=ws://localhost:8080/`
`VIRTUAL_PORT=8085`

1. First step is to build the jar file (run the following command in the root of the Socket Microservice):
`mvn clean package`

2. The docker file in the root directory can be build with:
`docker build -t websocket --build-arg VIRTUAL_PORT=8085 --build-arg SPACES_URL=ws://localhost:8080/ --no-cache .`

3. The docker image can then be run with:
`docker run -p 8085:8085 websocket`


