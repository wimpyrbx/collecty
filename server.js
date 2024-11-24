const express = require('express');
const app = express();
const db = require('./db');  // This will now use the singleton connection

// ... rest of your server code ...

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
}); 