const sqlite3 = require('sqlite3').verbose();

module.exports = class User {

    constructor(username, password, location, age, email) {
        this.userid = undefined;
        this.username = username;
        this.password = password;
        this.location = location;
        this.age = age;
        this.email = email;
        this.role = undefined;
    }

    static async getUserByUsername(username) {
        let result = await dbGetUserByUsername(username);
        let newUser = new User();

        if(result !== undefined) {
            newUser = new User(result.username, result.password, result.location, result.age, result.email);
            newUser.userid = result.userid;
            newUser.role = result.role;
        }

        return newUser;
    }

    static async getUserByEmail(email) {
        let result = await dbGetUserByEmail(email);
        let newUser = new User();

        if(result !== undefined) {
            newUser = new User(result.username, result.password, result.location, result.age, result.email);
            newUser.userid = result.userid;
        }

        return newUser;
    }

    static async getUserByUserid(userid) {
        let result = await dbGetUserByUserid(userid);
        let user = new User(result.username, result.password, result.location, result.age, result.email);
        user.userid = result.userid;
        user.role = result.role;

        return user;
    }

    async add() {
        this.userid = await dbAddUser(this);
        return;
    }

    async update() {
        let result = await dbUpdateUser(this);
        return result;
    }
    
    async delete() {
        let result = await dbDeleteUser(this);
        return result;
    }

    checkPassword(password) {
        if(this.password == password) {
            return true;
        } else {
            return false;
        }
    }

    isPersisted() {
        return this.userid !== undefined;
    }

    static async getBestBooks() {
        return new Promise((resolve, reject) => {
            // open the database
            let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
                if (err) {
                    console.log("Error" + err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });
    
            let best_books = [];
    
            db.serialize(() => {
                db.each(`SELECT title, author, yearofpublication, publisher, imageurlm
                        FROM ratings
                        JOIN books ON ratings.isbn = books.isbn
                        WHERE rating = 10
                        LIMIT 10`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    best_books.push(row);
                },
                () => {
                    resolve(best_books);
                });
            });
    
            db.close((err) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Close the database connection.');
            });
        });
    }

    static async getNUsers(rowSize, step) {
        return new Promise((resolve, reject) => {
            // open the database
            let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
                if (err) {
                    console.log("Error" + err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });
    
            let best_books = [];
    
            db.serialize(() => {
                db.each(`SELECT userid, username, email, location, age
                        FROM users
                        ORDER BY username DESC
                        LIMIT ${rowSize} OFFSET ${step}`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    best_books.push(row);
                },
                () => {
                    resolve(best_books);
                });
            });
    
            db.close((err) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Close the database connection.');
            });
        });
    }

    static async getUsersSize() {
        return new Promise((resolve, reject) => {
            // open the database
            let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
                if (err) {
                    console.log("Error " + err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });
    
            db.get(`SELECT COUNT(*) as 'count' FROM users`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
    
                if (!row || row.count === undefined) {
                    resolve(0);
                } else {
                    resolve(row.count);
                }
            });
    
            db.close((err) => {
                if (err) {
                    console.log(err.message);
                }
                console.log('Close the database connection.');
            });
        });
    }
}

async function dbGetUserByUsername(username) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count FROM users WHERE username = '${username}'`, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }

            if (row.count > 0) {
                db.get(`SELECT userid, location, age, username, password, email, role FROM users WHERE username = '${username}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                resolve(undefined);
            }
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

async function dbGetUserByEmail(email) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count FROM users WHERE email = '${email}'`, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }

            if (row.count > 0) {
                db.get(`SELECT userid, location, age, username, password, email, role FROM users WHERE email = '${email}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                resolve(undefined);
            }
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

async function dbAddUser(user) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`INSERT INTO users (username, password, location, age, email, role)
                VALUES ('${user.username}', '${user.password}', '${user.location}', ${parseInt(user.age)}, '${user.email}', '${user.role}')`,
                (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.lastID);
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

async function dbGetUserByUserid(userid) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT userid, location, age, username, email, password, role
                FROM users
                WHERE userid = ${userid}`,
                (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(row);
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

async function dbUpdateUser(user) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count FROM users WHERE userid = ${user.userid}`, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }

            if (row.count > 0) {
                db.get(`UPDATE users
                        SET location = '${user.location}',
                            age = ${user.age},
                            username = '${user.username}',
                            password = '${user.password}',
                            email = '${user.email}',
                            role = '${user.role}'
                        WHERE userid = ${user.userid}`, 
                        (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                reject("User that you are trying to update does not exist!");
            }
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

async function dbDeleteUser(user) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count FROM users WHERE userid = ${user.userid}`, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }

            if (row.count > 0) {
                db.get(`DELETE FROM users
                        WHERE userid = ${user.userid}`, 
                        (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                reject("User htat you are trying to delete does not exist!");
            }
        });

        // close database
        db.close((err) => {
            if (err) {
                console.log(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}