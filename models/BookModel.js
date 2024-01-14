const sqlite3 = require('sqlite3').verbose();

module.exports = class Book {

    constructor(isbn, title, author, yearofpublication, publisher) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.yearofpublication = yearofpublication;
        this.publisher = publisher;
        this.imageurls = undefined;
        this.imageurlm = undefined;
        this.imageurll = undefined;
        this.averagerating = undefined;
        this.rating = undefined;
    }

    async add(userid) {
        let result = await dbAddBook(this);
        result = await dbAddBookInRatings(this, userid);
        return;
    }

    static async getBookByISBN(isbn) {
        console.log(isbn);
        let result = await dbGetBookByISBN(isbn);
        console.log("Result of get book: ", result);
        let book = new Book(result.isbn, result.title, result.author, result.yearofpublication, result.publisher);
        book.imageurll = result.imageurll;
        book.averagerating = parseFloat(result.averagerating.toFixed(2));
        book.rating = await dbGetRatingByISBN(isbn);

        return book;
    }

    async update(userid) {
        console.log("Update function");
        let result = await dbUpdateBook(this, userid);
        console.log("Result of updating book: ", result);
        return;
    }

    async delete(userid) {
        let result = await dbDeleteBook(this, userid);
        return;
    }

    static async getNBooks(rowSize, step, userid) {
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
                db.each(`SELECT books.isbn, title, author, yearofpublication, publisher, imageurls, rating
                        FROM books
                        JOIN ratings ON ratings.isbn = books.isbn
                        WHERE userid = '${userid}'
                        ORDER BY title
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

    static async getBooksSize(userid) {
        return new Promise((resolve, reject) => {
            // open the database
            let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
                if (err) {
                    console.log("Error" + err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });
    
            db.get(`SELECT COUNT(*) as 'count' 
                    FROM books 
                    JOIN ratings ON ratings.isbn = books.isbn
                    WHERE userid = '${userid}'`, (err, row) => {
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

async function dbAddBook(book, userid) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count
                FROM books
                WHERE isbn = ${book.isbn}`, 
                (err, row) => {
            if (err) {
                console.error(err.message);
            }
            
            if(row.count < 1) {
                db.get(`INSERT INTO books (isbn, title, author, yearofpublication, publisher, imageurls, imageurlm, imageurll)
                        VALUES ('${book.isbn}', '${book.title}', '${book.author}', ${parseInt(book.yearofpublication)}, '${book.publisher}',
                                '${book.imageurls}', '${book.imageurlm}', '${book.imageurll}')`,
                        (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                console.log("Book already exists!");
                reject("Book already exists!");
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

async function dbAddBookInRatings(book, userid) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count
                FROM ratings
                WHERE isbn = ${book.isbn} and userid = ${userid}`, 
                (err, row) => {
            if (err) {
                console.error(err.message);
            }
            
            if(row.count < 1) {
                db.get(`INSERT INTO ratings (userid, isbn, rating)
                        VALUES (${userid}, '${book.isbn}', ${book.rating})`,
                        (err, row) => {
                    if(err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                console.log("Book already exists!");
                reject("Book already exists!");
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

async function dbGetBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error: " + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT AVG(rating) as averagerating, books.isbn, title, author, yearofpublication, publisher, imageurll
                FROM books
                JOIN ratings ON ratings.isbn = books.isbn
                WHERE books.isbn = '${isbn}'`, 
                (err, row) => {
            if (err) {
                console.log(err.message);
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

async function dbGetRatingByISBN(isbn) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READ, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT rating
                FROM ratings
                WHERE isbn = '${isbn}'`, 
                (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(row.rating);
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

async function dbUpdateBook(book, userid) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count
                FROM books
                WHERE isbn = '${book.isbn}'`, 
                (err, row) => {
            if (err) {
                console.error(err.message);
            }
            console.log(row);
            if(row.count > 0) {
                db.get(`UPDATE books
                        SET title = '${book.title}',
                            author = '${book.author}',
                            yearofpublication = ${book.yearofpublication},
                            publisher = '${book.publisher}',
                            imageurls = '${book.imageurls}',
                            imageurlm = '${book.imageurlm}',
                            imageurll = '${book.imageurll}'
                        WHERE isbn = '${book.isbn}'`,
                        (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
                db.get(`UPDATE ratings 
                        SET rating = ${book.rating}
                        WHERE userid = ${userid} AND isbn = '${book.isbn}'`,
                        (err, row) => {
                    if(err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                console.log("Book doesn't exist!");
                reject("Book doesn't exist!");
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

async function dbDeleteBook(book, userid) {
    return new Promise((resolve, reject) => {
        // open the database
        let db = new sqlite3.Database('./data/db/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error" + err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        db.get(`SELECT COUNT(*) as count
                FROM ratings
                WHERE isbn = ${book.isbn} AND userid = ${userid}`, 
                (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            
            if(row.count > 0) {
                db.get(`DELETE FROM ratings
                        WHERE isbn = '${book.isbn}' AND userid = ${userid}`,
                        (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(row);
                });
            } else {
                console.log("Rating doesn't exist!");
                reject("Rating doesn't exist!");
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