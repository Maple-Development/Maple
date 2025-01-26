/* eslint-disable no-unused-vars */
const express = require('express'), cookieParser = require('cookie-parser');
const mysql = require('mysql2');

const router = express.Router();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'maple_auth'
});

router.use(express.json());
router.use(cookieParser());

router.get('/user/:username', (req, res) => {
    const username = req.params.username; 
    const sql = 'SELECT id, username, name FROM users WHERE username = ?';

    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ error: 'Error fetching user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(results[0]);
    });
});


router.get('/pfp/:id', (req, res) => {
    const id = req.params.id; 
    const sql = 'SELECT pfp FROM users WHERE id = ?';

    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ error: 'Error fetching user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        if (!user.pfp) {
            return res.status(404).json({ error: 'User has no pfp' });
        }

        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', `attachment; filename="${id}.jpg"`);
        res.send(user.pfp);
    });
});

module.exports = router