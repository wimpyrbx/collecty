const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite3').verbose();

let db = null;

const getConnection = () => {
  if (db) {
    console.log('Using existing database connection');
    return db;
  }

  console.log('Creating new database connection');
  db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });

  // Add Promise support to the database
  db.getAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };

  db.allAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  db.runAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };

  return db;
};

module.exports = getConnection(); 