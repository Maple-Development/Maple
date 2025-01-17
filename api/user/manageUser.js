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


router.post('/setProfile/:id', (req, res) => {
    const id = req.user.id;
    const imageBlob = req.body.blob;

    if (!imageBlob || imageBlob.length > 3 * 1024 * 1024) {
        return res.status(400).json({ error: 'Invalid image size' });
    }

    const getUserSql = 'SELECT username, id FROM users WHERE id = ?';
    connection.query(getUserSql, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error fetching user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatePfpSql = 'UPDATE users SET pfp = ? WHERE id = ?';
        connection.query(updatePfpSql, [imageBlob, id], (updateError) => {
            if (updateError) {
                console.error(updateError);
                return res.status(500).json({ error: 'Error updating profile picture' });
            }
            return res.status(200).json({ message: 'Profile picture updated successfully' });
        });
    });
});

module.exports = router