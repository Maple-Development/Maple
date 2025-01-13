const express = require('express');
const cors = require('cors');
const login = require('./auth/login');
const app = express();
const PORT = 3000;

const fs = require('fs');
const https = require('https');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.dev/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(cors());
app.use('/login', login);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
	console.log('HTTPS Server running on port 443');
});