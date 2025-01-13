const express = require('express');
const cors = require('cors');
const login = require('./auth/login');
const app = express();

const fs = require('fs');
const https = require('https');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(cors());
app.use('/login', login);

https.createServer(credentials, app).listen(443)