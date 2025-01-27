// ONLY USE IN DEV ENVIRONMENT!

const express = require('express');
const cors = require('cors');
const login = require('./auth/login.js');
const getPath = require('./get/get.js');
const manageUser = require('./user/manageUser.js');
const publicGet = require('./publicGet/get.js');
const friends = require('./user/friends.js');
const ioTools = require('./iomanager/io.js');
const app = express();

const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
	debug: true
};

const corsOptions = {
	origin: 'http://localhost:5173',
	credentials: true
};

const server = http.createServer(app);

const io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:5173',
		credentials: true
	}
});

app.use(cors(corsOptions));
app.use('/peerjs', ExpressPeerServer(server, options));
app.use('/login', login);
app.use('/get', getPath);
app.use('/user/manage', manageUser);
app.use('/public/get', publicGet);
app.use('/user/friends', friends);

io.use((socket, next) => {
	const cookieString = socket.handshake.headers['cookie'];
	let token = null;

	if (cookieString) {
		const cookies = cookieString.split(';');
		const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith('token='));
		if (tokenCookie) {
			token = tokenCookie.split('=')[1];
		}
	}

	if (!token) {
		return next(new Error('Authentication error: Missing token'));
	}

	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return next(new Error('Authentication error: Invalid token'));
		}

		socket.user = decoded;
		next();
	});
});

io.on('connection', (client) => {
	console.log('User connected: ' + client.user.id);
	client.on('addFriend', (data) => {
		const userId = client.user.id;
		const friendId = data.friendId;
		ioTools.addFriend(userId, friendId);
	});
	client.on('disconnect', () => {
		/* … */
	});
});

server.listen(3000, () => {
	console.log('Server listening on port 3000');
});
