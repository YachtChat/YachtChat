const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.get('/', function(req, res){
    console.log("ready to send index");
    res.sendFile(__dirname + '/index.html');
    console.log("sent index");
});

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/www.alphabibber.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/www.alphabibber.com/fullchain.pem")
};


const server = https.createServer(options, app).listen(3000, () => {
    console.log('Server started at: 3000');
});

let io = require('socket.io').listen(server);


// http.listen(3000, () => {
//     console.log('Server started at: 3000');
// });

io.on('connection', function (socket) {
    io.sockets.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
    socket.on('signaling', function(data) {
        io.to(data.toId).emit('signaling', { fromId: socket.id, ...data });
    });
    socket.on('disconnect', function() {
        io.sockets.emit('user-left', socket.id)
    })
});
