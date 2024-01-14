const express = require('express');
const router = express.Router();
const Book = require('../models/BookModel');
const authHandler = require('./auth-handler');

router.get('/:isbn', authHandler, (req, res) => {
    (async () => {
        let book = await Book.getBookByISBN(req.params.isbn);
        res.render('editbook', {
            title: "Edit book",
            user: req.session.user,
            book: book,
            err: undefined
        });
    })();
});

module.exports = router;