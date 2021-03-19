const express = require('express');
const server = express();
const https = require('https').Server(server);

const fs = require('fs');

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/www.alphabibber.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/www.alphabibber.com/fullchain.pem")
};

server.use(express.static('public'));
https.createServer(options, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
}).listen(3000);

const io = require('socket.io')(https);


// http.listen(3000, () => {
//     console.log('Server started at: 3000');
// });

server.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    io.sockets.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
    socket.on('signaling', function(data) {
        io.to(data.toId).emit('signaling', { fromId: socket.id, ...data });
    });
    socket.on('disconnect', function() {
        io.sockets.emit('user-left', socket.id)
    })
});
