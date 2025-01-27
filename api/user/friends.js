/* eslint-disable no-unused-vars */
const express = require('express'),
cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const authenticateToken = require('../middleware/authToken');
const verifyUser = require('../middleware/verifyUser');
const socket = require('../socket');
const ioTools = require('../iomanager/io.js');

const router = express.Router();

const io = socket.getIO();

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'admin',
	database: 'maple_auth'
});

router.use(express.json());
router.use(cookieParser());
router.use(authenticateToken);
router.use(verifyUser);

router.post('/add/:id', (req, res) => {
	const id = req.params.id;
	const friendId = req.body.friendId;

	if (!friendId) {
		return res.status(400).json({ error: 'Friend ID is required.' });
	}

	const sql = 'INSERT INTO pending_requests (user_id, friend_id) VALUES (?, ?)';

	connection.query(sql, [id, friendId], async (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error adding friend' });
		}
		const friendSocket = await ioTools.getSocket(io, friendId);
		if (friendSocket) {
			ioTools.addFriend(id, friendId, friendSocket, io);
		}
		return res.status(200).json({ message: 'Request sent successfully' });
	});
});

router.post('/accept/:id', (req, res) => {
	const id = req.params.id;
	const friendId = req.body.friendId;

	if (!friendId) {
		return res.status(400).json({ error: 'Friend ID is required.' });
	}

	const isPending = 'SELECT * FROM pending_requests WHERE user_id = ? AND friend_id = ?';
	connection.query(isPending, [id, friendId], async (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error accepting friend request' });
		}
		if (results.length === 0) {
			const user = await ioTools.getSocket(io, id);
			if (user) {
				const data = "error";
				const message = 'Friend request not found';
				ioTools.emit(user, data, message, io);
			}
			return res.status(404).json({ error: 'Friend request not found' });
		}
	});

	const sql1 = 'DELETE FROM pending_requests WHERE user_id = ? AND friend_id = ?';
	connection.query(sql1, [id, friendId], (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error accepting friend request' });
		}
	});

	const sql = 'INSERT INTO friends_db (user_id, friend_id) VALUES (?, ?)';
	connection.query(sql, [id, friendId], async (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error accepting friend request' });
		}
		const user = await ioTools.getSocket(io, id);
		if (user) {
			const data = "requestAccepted";
			const message = {
				id: friendId,
				message: 'Friend request accepted!'
			};
			ioTools.emit(user, data, message, io);
		}
		const friendSocket = await ioTools.getSocket(io, friendId);
		if (friendSocket) {
			const data = "requestAccepted";
			const message = {
				id: id,
				message: 'Friend request accepted!'
			};
			ioTools.emit(friendSocket, data, message, io);
		}
		return res.status(200).json({ message: 'Friend request accepted successfully' });
	});
});


router.post('/decline/:id', (req, res) => {
	const id = req.params.id;
	const friendId = req.body.friendId;

	if (!friendId) {
		return res.status(400).json({ error: 'Friend ID is required.' });
	}

	const sql = 'DELETE FROM pending_requests WHERE user_id = ? AND friend_id = ?';

	connection.query(sql, [id, friendId], (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error declining friend request' });
		}
		return res.status(200).json({ message: 'Friend request declined successfully' });
	});
});

router.get('/get/requests/:id', (req, res) => {
	const id = req.params.id;

	const sql = 'SELECT * FROM pending_requests WHERE friend_id = ?';

	connection.query(sql, [id], (error, results) => {
		if (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error fetching friend requests' });
		}
		return res.status(200).json(results);
	});
});



module.exports = router;
