let myHostname = window.location.hostname;
if (!myHostname) {
    myHostname = "localhost";
}
log("Hostname: " + myHostname);

let connection = null; // connection to websocket

let clientID = 0; // this will be changed as soon as we connect to the server
let myUsername;

let connectedUsers = []; // all but current user
// [0, 1, 2, 3, ...]

let peerConnections = {}; // all RTCConnections
// let peerConnections = {
//     "0": RTCConnection(...), 
//     "1": RTCConnection(...),
//     ...
// }

let transceivers = {};
let webcamStreams = {};

function log(text) {
    const time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function log_error(text) {
    var time = new Date();

    console.trace("[" + time.toLocaleTimeString() + "] " + text);
}

function sendToServer(msg) {
    log("Starting send to server");
    const msgJson = JSON.stringify(msg);

    log("Sending '" + msg.type + "' message: " + msgJson);
    // TODO: instantiate connection
    connection.send(msgJson);
}

// Called when the "id" message is received; this message is sent by the
// server to assign this login session a unique ID number; in response,
// this function sends a "username" message to set our username for this
// session.
function setUsername() {

    sendToServer({
        name: clientID,
        date: Date.now(),
        id: clientID,
        type: "username"
    });
}

// Open and configure the connection to the WebSocket server.
function connect() {
    // document.getElementById("mybutton1").addEventListener("click", function () {
    //     invite1();
    // });

    // document.getElementById("mybutton2").addEventListener("click", function () {
    //     invite2();
    // });

    let serverUrl;
    let scheme = "ws";

    if (document.location.protocol === "https:") {
        scheme += "s";
    }
    serverUrl = scheme + "://" + myHostname + ":6503";
    log(`Connecting to server: ${serverUrl}`);

    connection = new WebSocket(serverUrl, "json");


    connection.onopen = function (evt) {
        log("Connection to server opened");
    }

    connection.onerror = function (evt) {
        console.dir(evt);
    }

    connection.onmessage = function (e) {
        log(`Got message with data ${e.data}`);

        let msg = JSON.parse(e.data);

        switch (msg.type) {
            case "id":
                log(`Setting clientID to ${msg.id}`);
                clientID = msg.id;
                setUsername();
                break;
            case "offer":
                // handleOsffer(msg);
                log(`offer: ${msg}`);
                break;f
            case "answer":
                // handleAnswer(msg);
                log(`answer: ${msg}`);
                break;
            case "new-ice-candidate":
                handleNewICECandidateMsg(msg);
                break;
            case "userlist":
                handleUserlistMsg(msg);
                break;
            case "video-offer": // Invitation and offer to chat
                handleVideoOfferMsg(msg);
                break;
            case "video-answer": // Callee has answered our offer
                handleVideoAnswerMsg(msg);
                break;

            default:
                log_error("Unknown message received");
                log_error(msg);
        }
    }
}

async function createPeerConnection(targetUser) {
    log(`Setting up connection to ${targetUser}...`);

    // target user is id with type int (number)
    if (peerConnections.hasOwnProperty(targetUser)) {
        // connection already established
        // TODO: handle this
    } else {
        const configuration = {};
        peerConnections[targetUser] = new RTCPeerConnection(configuration);
    }


    // peerConnections[targetUser].onicecandidate = handleICECandidateEvent(targetUser);
    // alternative:
    peerConnections[targetUser].addEventListener('icecandidate', (e) => {
        handleICECandidateEvent(e, targetUser);
    });
    peerConnections[targetUser].oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    // peerConnections[targetUser].onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    // peerConnections[targetUser].onsignalingstatechange = handleSignalingStateChangeEvent;

    peerConnections[targetUser].onnegotiationneeded = handleNegotiationEvent(targetUser);
    // peerConnections[targetUser].addEventListener('negotiationneeded', (e) => {
    //     handleN
    // });

    peerConnections[targetUser].ontrack = handleTrackEvent;
}

// Handle |iceconnectionstatechange| events. This will detect
// when the ICE connection is closed, failed, or disconnected.
//
// This is called when the state of the ICE agent changes.

function handleICEConnectionStateChangeEvent(event) {
    log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);
  
    switch(myPeerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        // closeVideoCall();
        break;
    }
  }

// Called by the WebRTC layer to let us know when it's time to
// begin, resume, or restart ICE negotiation
async function handleNegotiationEvent(targetUser) {
    log("***Negotiation needed");

    try {
        log("---> Creating offer");
        const offer = await peerConnections[targetUser].createOffer();

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.

        if (peerConnections[targetUser].signalingState != "stable") {
            log("    -- The connection isn't stable yet; postponing...");
            return;
        }

        // Establish the offer as the local peer's current description.

        log("---> Setting local description to the offer");
        await peerConnections[targetUser].setLocalDescription(offer);

        // Send the offer to the remote peer.

        log(`Current peerconncetions:`);
        console.dir(peerConnections);
        log(`---> Sending the offer to the remote peer, targetUser ${targetUser}`);
        log('Sending message:');
        const mymsg = {
            name: clientID,
            target: targetUser,
            type: "video-offer",
            sdp: peerConnections[targetUser].localDescription
        };
        console.dir(mymsg);
        sendToServer(mymsg);
    } catch (err) {
        log("*** The following error occurred while handling the negotiationneeded event:");
        reportError(err);
    }
}

// Handle a click on an item in the user list by inviting the clicked
// user to video chat. Note that we don't actually send a message to
// the callee here -- calling RTCPeerConnection.addTrack() issues
// a |notificationneeded| event, so we'll let our handler for that
// make the offer.
async function invite(usernamebutcurrentlyid) {
    const targetUser = usernamebutcurrentlyid;
    log("Starting to prepare an invitation");
    await createPeerConnection(targetUser);
    try {
        // webcamStreams[clientID] = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        webcamStreams[targetUser] = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        document.getElementById("video").srcObject = webcamStreams[targetUser];
    } catch(err) {
        console.err('handleGetUserMediaError');
        return;
    }

    try {
        // // WEIRD
        // webcamStreams[clientID].getTracks().forEach(track => {
        //     transceivers[clientID] = track;
        //     peerConnections[clientID].addTransceiver(track, {streams: [webcamStreams[clientID]]});
        //     peerConnections[clientID].addTrack(track, webcamStreams[clientID]);
        // }
        // );
        // webcamStreams[targetUser].getTracks().forEach(track => {
        //     transceivers[targetUser] = track;
        //     peerConnections[targetUser].addTransceiver(track, {streams: [webcamStreams[targetUser]]});
        //     peerConnections[targetUser].addTrack(track, webcamStreams[targetUser]);
        // }
        // );
        // BEFORE:
        webcamStreams[targetUser].getTracks().forEach(
            // transceivers[targetUser] = track => peerConnections[targetUser].addTransceiver(track, {streams: [webcamStreams[targetUser]]})
            track => peerConnections[targetUser].addTrack(track, webcamStreams[targetUser])
        );
      } catch(err) {
        // handleGetUserMediaError(err);
        console.error('handlegetusermedia error in invite');
        console.error(err.stack);
    }
}

// Handles |icecandidate| events by forwarding the specified
// ICE candidate (created by our local ICE agent) to the other
// peer through the signaling server.

function handleICECandidateEvent(event, targetUser) {
    if (event.candidate) {
        log("*** Outgoing ICE candidate: " + event.candidate.candidate);

        sendToServer({
            type: "new-ice-candidate",
            target: targetUser,
            candidate: event.candidate
        });
    }
}

// Handles reporting errors. Currently, we just dump stuff to console but
// in a real-world application, an appropriate (and user-friendly)
// error message should be displayed.

function reportError(errMessage) {
    log_error(`Error ${errMessage.name}: ${errMessage.message}`);
}


// Given a message containing a list of usernames, this function
// populates the user list box with those names, making each item
// clickable to allow starting a video call.

function handleUserlistMsg(msg) {
    var listElem = document.querySelector(".userlistbox");

    // Remove all current list members. We could do this smarter,
    // by adding and updating users instead of rebuilding from
    // scratch but this will do for this sample.

    while (listElem.firstChild) {
        listElem.removeChild(listElem.firstChild);
    }

    // Add member names from the received list.

    msg.users.forEach(function (username) {
        var item = document.createElement("li");
        item.appendChild(document.createTextNode(username));
        item.addEventListener("click", (event) => {
            invite(username);
        }, false);

        listElem.appendChild(item);
    });
}

// Accept an offer to video chat. We configure our local settings,
// create our RTCPeerConnection, get and attach our local camera
// stream, then create and send an answer to the caller.
async function handleVideoOfferMsg(msg) {
    let targetUser = msg.name;

    if (!peerConnections[targetUser]) {
        await createPeerConnection(targetUser);
    }

    var desc = new RTCSessionDescription(msg.sdp);

    // If the connection isn't stable yet, wait for it...

    if (peerConnections[targetUser].signalingState != "stable") {
        log("  - But the signaling state isn't stable, so triggering rollback");

        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
            peerConnections[targetUser].setLocalDescription({ type: "rollback" }),
            peerConnections[targetUser].setRemoteDescription(desc)
        ]);
        return;
    } else {
        log("  - Setting remote description");
        await peerConnections[targetUser].setRemoteDescription(desc);
    }

    // if (!webcamStreams[clientID]) {
    //     webcamStreams[clientID] = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    // }
        
    // Get the webcam stream if we don't already have it
    if (!webcamStreams[targetUser]) {
        try {
            webcamStreams[targetUser] = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        } catch (err) {
            console.error(err)
            // handleGetUserMediaError(err);
            return;
        }

        document.getElementById("video").srcObject = webcamStreams[targetUser];

        // Add the camera stream to the RTCPeerConnection

        try {
            webcamStreams[targetUser].getTracks().forEach(
                // transceivers[targetUser] = track => peerConnections[targetUser].addTransceiver(track, {streams: webcamStreams[targetUser]})
                track => peerConnections[targetUser].addTrack(track, webcamStreams[targetUser])
            );
        } catch (err) {
            // handleGetUserMediaError(err);
            console.error('handlegetuser media error');
            console.error(err.stack);
        }
    }

    log("---> Creating and sending answer to caller");

    await peerConnections[targetUser].setLocalDescription(await peerConnections[targetUser].createAnswer());

    sendToServer({
        name: myUsername,
        // COMMENTED THIS OUT
        target: targetUser,
        source: clientID,
        type: "video-answer",
        sdp: peerConnections[targetUser].localDescription
    });
}

// function gotRemoteStream(event, id) {
//     let video = document.createElement('video');

//     video.setAttribute('data-socket', id);
//     video.src         = window.URL.createObjectURL(event.stream);
//     video.autoplay    = true; 
//     video.muted       = true;
//     video.playsinline = true;

    // document.getElementById('videocontainer').appendChild(video);
// }

let mediaConstraints = {
    audio: true,            // We want an audio track
    video: {
        aspectRatio: {
            ideal: 1.333333     // 3:2 aspect is preferred
        }
    }
};


function handleTrackEvent(event) {
    log("****** Track event");
    let video = document.createElement('video');
    video.src         = window.URL.createObjectURL(event.streams[0]);
    video.autoplay    = true; 
    video.muted       = true;
    video.playsinline = true;
    // document.getElementById("received_video").srcObject = event.streams[0];
    document.getElementById('videocontainer').appendChild(video);
}

async function handleVideoAnswerMsg(msg) {
    log("*** Call recipient has accepted our call");
    console.dir(msg);
    // const targetUser = msg.name;
    const targetUser = msg.source;
    log("Current PeerConnections:");
    console.dir(peerConnections);
  
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
  
    let desc = new RTCSessionDescription(msg.sdp);
    await peerConnections[targetUser].setRemoteDescription(desc).catch(reportError);
  }