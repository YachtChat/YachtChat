import http from "http"
import https from "https"
import fs from "fs"
import {server} from "websocket"

"use strict";
const keyFilePath = "/etc/letsencrypt/live/www.alphabibber.com/privkey.pem";
const certFilePath = "/etc/letsencrypt/live/www.alphabibber.com/fullchain.pem";

// gloabal variables
let WebSocketServer = server;
let users = new Map();
let connections = new Map();
let nextID = Date.now();

// webserver configuations
function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}
var httpsOptions = {
  key: null,
  cert: null
};

try {
  httpsOptions.key = fs.readFileSync(keyFilePath);
  try {
    httpsOptions.cert = fs.readFileSync(certFilePath);
  } catch(err) {
    httpsOptions.key = null;
    httpsOptions.cert = null;
  }
} catch(err) {
  httpsOptions.key = null;
  httpsOptions.cert = null;
}

// If we were able to get the key and certificate files, try to
// start up an HTTPS server.

var webServer = null;

try {
  if (httpsOptions.key && httpsOptions.cert) {
    webServer = https.createServer(httpsOptions, handleWebRequest);
  }
} catch(err) {
  webServer = null;
}

if (!webServer) {
  try {
    webServer = http.createServer({}, handleWebRequest);
  } catch(err) {
    webServer = null;
    log(`Error attempting to create HTTP(s) server: ${err.toString()}`);
    log("test"):
  }
}

function handleWebRequest(request, response) {
  log ("Received request for " + request.url);
  response.writeHead(404);
  response.end();
}

// Spin up the HTTPS server on the port assigned to this sample.
// This will be turned into a WebSocket port very shortly.

webServer.listen(process.env.PORT, function() {
  log(`Server started on Port:  ${process.env.PORT}`);
});

// Create the WebSocket server by converting the HTTPS server into one.

let wsServer = new WebSocketServer({
  httpServer: webServer,
  autoAcceptConnections: false
});

if (!wsServer) {
  log("ERROR: Unable to create WbeSocket server!");
}

// Set up a "connect" message handler on our WebSocket server. This is
// called whenever a user connects to the server's port using the
// WebSocket protocol.

// ======================== Custom code ========================
wsServer.on('request', function(request) {

  // create new connection
  let connection = request.accept("json", request.origin);
  log("Connection accepted from " + connection.remoteAddress + ".");

  // create new User object and safe User and connection to Map using the unique id
  let user = {id: nextID};
  users.set(nextID, user);
  connections.set(nextID, connection);
  nextID++;

  // answer the user that just connected
  connections.get(user.id).sendUTF(JSON.stringify({"type": "id", "id": user.id}));

  // all the other communication with the client will be handled with "connection.on("message", ...)
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // log the mesage that the server received from the client

      try{
        message = JSON.parse(message.utf8Data);
      } catch(error){
        log("ERROR: Message is not of type json");
        return;
      }
      // every connection has and type and the sender id
      let type;
      try{
        type = message.type;
      } catch(error){
        log("ERROR: A message from a client should have a 'type'");
        return;
      }
      // handle different types
      switch(type) {
        case "login":
          let name;
          try{
            name = message.name;
          } catch(error){
            log("ERROR: For login the client should provide a name");
            return;
          }
          login(user.id, name);
          break;
        case "join":
          join(user.id);
          break;
        case "position_change":
          let x, y, range;
          try{
            x = message.position.x;
            y = message.position.y;
            range = message.position.range;
          } catch(error){
            log("ERROR: A position change should provide a x, y and range value");
            return;
          }
          positionChange(user.id, x, y, range);
          break;
        case "signaling":
          let target;
          try{
            target = message.target;
          } catch(error){
            log("ERROR: A signaling message should have a target and a content");
          }
          let content = {...message};
          delete content["type"];
          delete content["id"];
          delete  content["target"];
          signaling(user.id, target, content);
          break;
        case "leave":
          leave(user.id);
          break;
        default:
          log("This message is not of known type")
          return
      }
    }
  });
  // user disconnection
  connection.on('close', function(reason, description) {
    leave(user.id)
  });
});

function login(id, name){
  users.get(id).name = name;
  connections.get(id).sendUTF(JSON.stringify({"type": "login", "success": true}));
}

function join(id){
  // give the user a initial position
  users.get(id).position = {x: 200, y:200, range: 0.2};
  // send to the user that logged on
  connections.get(id).sendUTF(JSON.stringify({"type": "join", "users": Object.fromEntries(users)}));
  connections.forEach(function (connection, target) {
    // don't send the new user to the new user
    if (target !== id){
      connection.sendUTF(JSON.stringify({"type": "new_user", "user": users.get(id)}));
    }
  });
}

function positionChange(id, x, y, range){
  users.get(id).position = {x: x, y: y, range: range};
  connections.forEach(function (connection, _){
    connection.sendUTF(JSON.stringify({"type": "position_change", "id": id, "position": users.get(id).position}));
  });
}

function signaling(id, target, message){
  const obj = {"type": "signaling", "source": id};
  const combinedObj = {...obj, ...message};
  try{
    connections.get(target).sendUTF(JSON.stringify(combinedObj));
  } catch(error){
    log("ERROR: This target does not exist")
  }
}

function leave(id){
  log("User with id " + id + " left")
  users.delete(id);
  connections.delete(id);
  connections.forEach(function (connection, _){
    connection.sendUTF(JSON.stringify({"type": "user_left", "id": id}));
  })
}

