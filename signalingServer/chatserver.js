//#!/usr/bin/env node
//
// WebSocket chat server
// Implemented using Node.js
//
// Requires the websocket module.
//
// WebSocket and WebRTC based multi-user chat sample with two-way video
// calling, including use of TURN if applicable or necessary.
//
// This file contains the JavaScript code that implements the server-side
// functionality of the chat system, including user ID management, message
// reflection, and routing of private messages, including support for
// sending through unknown JSON objects to support custom apps and signaling
// for WebRTC.
//
// Requires Node.js and the websocket module (WebSocket-Node):
//
//  - http://nodejs.org/
//  - https://github.com/theturtle32/WebSocket-Node
//
// To read about how this sample works:  http://bit.ly/webrtc-from-chat
//
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/
import { Position, User } from "./user.js"
import http from "http"
import https from "https"
import fs from "fs"
import { server } from "websocket"

"use strict";

var WebSocketServer = server;

// Pathnames of the SSL key and certificate files to use for
// HTTPS connections.

const keyFilePath = "/etc/letsencrypt/live/www.alphabibber.com/privkey.pem";
const certFilePath = "/etc/letsencrypt/live/www.alphabibber.com/fullchain.pem";

// Used for managing the text chat user list.

var userArray = [];
var nextID = Date.now();
var appendToMakeUnique = 1;

// Output logging information to console

function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}

// Scan the list of connections and return the one for the specified
// clientID. Each login gets an ID that doesn't change during the session,
// so it can be tracked across username changes.
function getUserById(id){
  var user = undefined
  for (var i=0; i<userArray.length; i++){
    if(userArray[i].id == id){
      user = userArray[i]
    }
  }
  return user
}

// Builds a message object of type "userlist" which contains the names of
// all connected users. Used to ramp up newly logged-in users and,
// inefficiently, to handle name change notifications.
function makeUserListMessage() {
  var userListMsg = {
    type: "userlist",
    users: []
  };
  var i;
  for (i=0; i<userArray.length; i++) {
    userListMsg.users.push(userArray[i].getRep());
  }
  return userListMsg;
}

// Sends a "userlist" message to all chat members. This is a cheesy way
// to ensure that every join/drop is reflected everywhere. It would be more
// efficient to send simple join/drop messages to each user, but this is
// good enough for this simple example.
function sendUserListToAll() {
  var userListMsg = makeUserListMessage();
  var userListMsgStr = JSON.stringify(userListMsg);
  var i;
  for (i=0; i<userArray.length; i++) {
    userArray[i].getConnection().sendUTF(userListMsgStr);
  }
}


// Try to load the key and certificate files for SSL so we can
// do HTTPS (required for non-local WebRTC).

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
  }
}


// Our HTTPS server does nothing but service WebSocket
// connections, so every request just returns 404. Real Web
// requests are handled by the main server on the box. If you
// want to, you can return real HTML here and serve Web content.

function handleWebRequest(request, response) {
  log ("Received request for " + request.url);
  response.writeHead(404);
  response.end();
}

// Spin up the HTTPS server on the port assigned to this sample.
// This will be turned into a WebSocket port very shortly.

webServer.listen(6503, function() {
  log("Server is listening on port 6503");
});

// Create the WebSocket server by converting the HTTPS server into one.

var wsServer = new WebSocketServer({
  httpServer: webServer,
  autoAcceptConnections: false
});

if (!wsServer) {
  log("ERROR: Unable to create WbeSocket server!");
}

// Set up a "connect" message handler on our WebSocket server. This is
// called whenever a user connects to the server's port using the
// WebSocket protocol.

wsServer.on('request', function(request) {
  var connection = request.accept("json", request.origin);

  // Add the new connection to our list of connections.

  log("Connection accepted from " + connection.remoteAddress + ".");
  var user = new User(nextID, connection, new Position(-1, -1, -1))
  userArray.push(user)
  nextID++;

  // Send the new client its token; it send back a "username" message to
  // tell us what username they want to use.
  var msg = {
    type: "id",
    id: user.id
  };
  connection.sendUTF(JSON.stringify(msg));

  // Set up a handler for the "message" event received over WebSocket. This
  // is a message sent by a client, and may be text to share with other
  // users, a private message (text or signaling) for one user, or a command
  // to the server.

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      log("Recceived Message: " + message.utf8Data);

      // Process incoming data.

      var sendToClients = true;
      try{
        msg = JSON.parse(message.utf8Data);
      } catch(error){
        console.log("Message is not of type json")
        return
      }
      // user that send the request
      var user = getUserById(msg.id);

      // Take a look at the incoming object and act on it based
      // on its type. Unknown message types are passed through,
      // since they may be used to implement client-side features.
      // Messages with a "target" property are sent only to a user
      // by that name.

      switch(msg.type) {
        // Username change
        case "login":
          changeUsername(user, msg)
          break;
        // Public, textual message
        case "message":
          forwardMessage(user, msg)
          break;
        case "position":
          updatePosition(user, msg)
          break;
        default:
          console.log("This message is not of known type")
          return
      }
    }
  });
  // Handle the WebSocket "close" event; this means a user has logged off
  // or has been disconnected.
  connection.on('close', function(reason, description) {
    // First, remove the connection from the list of connections.
    connectionArray = connectionArray.filter(function(el, idx, ar) {
      return el.connected;
    });

    // Now send the updated user list. Again, please don't do this in a
    // real application. Your users won't like you very much.
    sendUserListToAll();

    // Build and output log output for close information.

    var logMessage = "Connection closed: " + connection.remoteAddress + " (" +
                     reason;
    if (description !== null && description.length !== 0) {
      logMessage += ": " + description;
    }
    logMessage += ")";
    log(logMessage);
  });
});

// case "username"
function changeUsername(user, message){
  // update the user object 
  user.name = message.name
        
  // let user know that it was successful
  var changeMsg = {
    success: true,
    type: "login",
    name: user.name
  };
  user.connection.sendUTF(JSON.stringify(changeMsg))

  // let all user know
  sendUserListToAll();
}

// case "message"
function forwardMessage(user, message){
  message.text = message.text.replace(/(<([^>]+)>)/ig, "");
  var msgString = JSON.stringify(message);
  var target = undefined
  if (message.target) {
    target = getUserById(message.target)
  }
  if (message.target) {
    target.getConnection().sendUTF(msgString);
  } else {
    for (var i=0; i<userArray.length; i++) {
      userArray[i].getConnection().sendUTF(msgString);
    }
  }

}

// case "postion"
function updatePosition(user, message){
  var x = message.position.x 
  var y = message.position.y 
  var r = x = message.position.radius 
  user.position = new Position(x,y,r)
  sendUserListToAll();
}

