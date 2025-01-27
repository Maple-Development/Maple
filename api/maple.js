const express = require('express');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const login = require('./auth/login');
const getPath = require('./get/get.js');
const mysql = require('mysql2');
const manageUser = require('./user/manageUser.js');
const publicGet = require('./publicGet/get.js');
const ioTools = require('./iomanager/io.js');
const socket = require('./socket');
const app = express();

const fs = require('fs');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
	debug: true
};

/* const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	max: 20,
}); */

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'admin',
	database: 'maple_auth'
});


const privateKey = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const corsOptions = {
	origin: 'https://beta.cattn.dev/',
	credentials: true
  };

const server = https.createServer(credentials, app);

const ioOptions = {
	cors: {
		origin: "https://beta.cattn.dev/",
		credentials: true
	}
};

const io = socket.init(server, ioOptions);

const friends = require('./user/friends.js');

/* app.use(limiter);
 */
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

	client.on('nowPlaying', async (data) => {
        const id = client.user.id;
        
        const sql = 'SELECT * FROM friends_db WHERE user_id = ? OR friend_id = ?';

        try {
            const [allFriends] = await connection.promise().query(sql, [id, id]);
            const sorted = sortFriends(allFriends, id);

            if (allFriends !== null && allFriends.length > 0) {
                ioTools.nowPlaying(id, sorted, io, data.nowPlaying);
            }
        } catch (error) {
            console.error(error);
        }
    });

	client.on('disconnect', () => {
		/* … */
	});
});

io.on('disconnect', (reason) => {
	console.log(`Disconnected: ${reason}`);
});

io.on('connect_error', (error) => {
	console.log(`Connection error: ${error}`);
});

function sortFriends(unsorted, id) {
	let newFriends = unsorted.map((friend) => {
		if (friend.user_id === id) {
			return { user_id: id, friend_id: friend.friend_id };
		} else {
			return { user_id: id, friend_id: friend.user_id };
		}
	});
	return newFriends;
}

server.listen(3000);
