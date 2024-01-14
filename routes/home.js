const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

router.get('/', (req, res) => {
    (async() => {
        let books;
        try {
            books = await User.getBestBooks();

            // send results
            res.status(200);
            res.render('home', {
                title: 'Home',
                books: books,
                user: req.session.user
            });
        } catch(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    })();
});

module.exports = router;