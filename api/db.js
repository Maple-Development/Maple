const mysql = require('mysql2');

console.log('Initializing database connection pool...');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'maple_auth',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Fatal error connecting to the database:', err);
        process.exit(1);
    }
    
    if (connection) {
        console.log('Successfully connected to the database.');
        connection.release();
    }
});

pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
        process.exit(1);
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
        process.exit(1);
    }
});

module.exports = pool; 