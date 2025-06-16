import { handler } from './build/handler.js';
import express from 'express';
import path from 'path';
import * as fs from 'fs';
import https from 'node:https';

const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/maple.kolf.pro/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const server = https.createServer(credentials, app);

const uploadsPath = path.join(process.cwd(), 'SMS', 'uploads');
if (fs.existsSync(uploadsPath)) {
    app.use('/SMS/uploads', express.static(uploadsPath));
}

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

server.listen(443);