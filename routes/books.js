const express = require('express');
const router = express.Router();
const authHandler = require('./auth-handler');
const Book = require('../models/BookModel');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', authHandler, (req, res) => {
    (async() => {
        try {
            let page = parseInt(req.query.page) || 1;
            const rowSize = 20;
            let books = await Book.getNBooks(rowSize, (page-1) * rowSize, req.session.user.userid);
            let totalCount = Object.keys(books).length;
            let sizeofBooks = await Book.getBooksSize(req.session.user.userid);
            let total = Math.ceil(sizeofBooks / rowSize);
            res.status(200);
            res.render('books', {
                title: 'Book list',
                currentPage: page,
                totalPages: total,
                totalCount: totalCount,
                books: books,
                rowSize: rowSize,
                user: req.session.user,
                specificUser: undefined,
                err: undefined
            });
        } catch(err) {
            res.status(500).send("Internal Server Error");
        }
    })();
});

router.get('/add', authHandler, (req, res) => {
    res.status(200);
    res.render('addbook', {
        title: "Add new book",
        user: req.session.user,
        err: undefined
    });
});

router.post('/', authHandler, (req, res) =>{
    (async () => {
        let book = new Book(req.body.isbn, req.body.title, req.body.author, req.body.yearofpublication, req.body.publisher);
        book.imageurls = req.body.imageurls;
        book.imageurlm = req.body.imageurlm;
        book.imageurll = req.body.imageurll;
        book.rating = req.body.rating || 0;
        let errmsg = undefined;
        try {
            await book.add(parseInt(req.session.user.userid));
        } catch(err) {
            console.error(err);
            errmsg = err;
        }
        //console.log(book);

        let page = parseInt(req.query.page) || 1;
        const rowSize = 20;
        let books = await Book.getNBooks(rowSize, (page-1) * rowSize, req.session.user.userid);
        let totalCount = Object.keys(books).length;
        let sizeofBooks = await Book.getBooksSize(req.session.user.userid);
        let total = Math.ceil(sizeofBooks / rowSize);
        res.status(201);
        res.render('books', {
            title: 'Book list',
            currentPage: page,
            totalPages: total,
            totalCount: totalCount,
            books: books,
            rowSize: rowSize,
            user: req.session.user,
            specificUser: undefined,
            err: errmsg
        });
    })();
});

router.get('/edit/:isbn', authHandler, (req, res) => {
    //console.log("I'm in edit!");
    (async () => {
        console.log(req.params.isbn);
        let book = await Book.getBookByISBN(req.params.isbn);
        res.status(200);
        res.render('editbook', {
            title: "Edit book",
            user: req.session.user,
            book: book,
            err: undefined
        });
    })();
});

router.delete('/:isbn', authHandler, (req, res) => {
    //console.log("I'm in delete!");
    (async () => {
        let book = await Book.getBookByISBN(req.params.isbn);
        console.log(book);

        await book.delete(req.session.user.userid);
        res.redirect('/api/books');
    })();
});

router.get('/:isbn', authHandler, (req, res) => {
    //console.log("I'm in get for specific book: ", req.params.isbn);
    (async () => {
        let book = await Book.getBookByISBN(req.params.isbn);
        res.status(200);
        res.render('book', {
            title: "Book showcase",
            book: book,
            user: req.session.user
        });
    })();    
});

router.put('/:isbn', authHandler, (req, res) => {
    console.log("I got into put!");
    (async () => {
        let oldBook = await Book.getBookByISBN(req.body.isbn);
        let newBook = new Book(req.body.isbn, req.body.title, req.body.author, req.body.yearofpublication, req.body.publisher);
        newBook.imageurls = req.body.imageurls;
        newBook.imageurlm = req.body.imageurlm;
        newBook.imageurll = req.body.imageurll;
        newBook.rating = parseInt(req.body.rating);

        console.log("Old Book: ", oldBook);
        console.log("New Book: ", newBook);

        await newBook.update(parseInt(req.session.user.userid));
        let book = await Book.getBookByISBN(req.body.isbn);
        res.status(200);
        res.render('book', {
            title: "Book showcase",
            book: book,
            user: req.session.user
        });
    })();
});

module.exports = router;