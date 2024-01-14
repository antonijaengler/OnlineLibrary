const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
    if (err) {
        console.log("Error" + err.message);
        reject(err);
    } else{
        console.log('Connected to the database.');
    }
});

module.exports = db;