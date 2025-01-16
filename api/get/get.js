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


router.get('/user/:id', (req, res) => {
    const id = req.user.id;
    const sql = 'SELECT username, id FROM users WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error(error + "ewfewfw ");
            return res.status(500).json({ error: 'Error fetching user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = results[0];
        return res.status(200).json(user);
    });
});



module.exports = router