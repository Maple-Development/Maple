/* eslint-disable no-unused-vars */
import express from 'express';

import cookieParser from 'cookie-parser';
import mysql from 'mysql2';
import authenticateToken from '../middleware/authToken.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

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

router.get('/user/:id', (req, res) => {
	const id = req.user.id;
	const sql = 'SELECT username, id, name, pfp FROM users WHERE id = ?';

	connection.query(sql, [id], (error, results) => {
		if (error) {
			console.error('Error fetching user:', error);
			return res.status(500).json({ error: 'Error fetching user' });
		}
		if (results.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		const user = results[0];
		const response = {
			username: user.username,
			id: user.id,
			name: user.name,
			pfp: user.pfp ? user.pfp.toString('base64') : null
		};

		return res.status(200).json(response);
	});
});

router.get('/isAuthenticated/:id', (req, res) => {
	return res.status(200).json({ isAuthenticated: true });
});

router.get('/logout/:id', (req, res) => {
	res.clearCookie('token');
	return res.status(200).json({ message: 'Logout successful' });
});

export default router;
