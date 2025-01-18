// ONLY USE IN DEV ENVIRONMENT!

const express = require('express');
const cors = require('cors');
const login = require('./auth/login.js');
const getPath = require('./get/get.js')
const manageUser = require('./user/manageUser.js')
const publicGet = require('./publicGet/get.js')
const app = express();

const http = require('http');

var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
    debug: true
}

const corsOptions = {
  origin: true,
  credentials: true
};

const server = http.createServer(app);

const io = require('socket.io')(server);

app.use(cors(corsOptions));
app.use('/peerjs', ExpressPeerServer(server, options));
app.use('/login', login);
app.use('/get', getPath);
app.use('/user/manage', manageUser);
app.use('/public/get', publicGet);

io.on('connection', client => {
    // eslint-disable-next-line no-unused-vars
    client.on('event', data => { /* … */ });
    client.on('disconnect', () => { /* … */ });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
 