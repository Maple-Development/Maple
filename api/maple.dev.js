// ONLY USE IN DEV ENVIRONMENT!

const express = require('express');
const cors = require('cors');
const login = require('./auth/login');
const app = express();

const http = require('http');

var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
    debug: true
}

const server = http.createServer(app);

app.use(cors()); 
app.use('/peerjs', ExpressPeerServer(server, options));
app.use('/login', login);

server.listen(80, () => {
    console.log('Server listening on port 80');
});
 