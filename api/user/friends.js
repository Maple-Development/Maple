/* eslint-disable no-unused-vars */
const express = require('express'), cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const authenticateToken = require('../middleware/authToken');
const verifyUser = require('../middleware/verifyUser');

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


router.post('/add/:id', (req, res) => { 
    const id = req.params.id;
    const friendId = req.body.friendId;

    if (!friendId) {
        return res.status(400).json({ error: 'Friend ID is required.' });
    }

    const sql = 'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)';

    connection.query(sql, [id, friendId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error adding friend' });
        }
        return res.status(200).json({ message: 'Friend added successfully' });
    });
});


module.exports = router