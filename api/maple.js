const express = require('express');
const cors = require('cors');
const login = require('./auth/login');
const app = express();
const PORT = 3000;

app.use(cors());
app.use('/login', login);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

