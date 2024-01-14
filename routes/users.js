const express = require('express');
const router = express.Router();
const authHandler = require('./auth-handler');
const adminHandler = require('./admin-handler');
const User = require('../models/UserModel');
const Book = require('../models/BookModel');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', authHandler, (req, res) => {
    console.log("Signed user: ", req.session.user);
    (async() => {
        let page = parseInt(req.query.page) || 1;
        const rowSize = 20;
        let users = await User.getNUsers(rowSize, (page-1) * rowSize);
        let totalCount = Object.keys(users).length;
        let sizeofUsers = await User.getUsersSize();
        let total = Math.ceil(sizeofUsers / rowSize);
        res.status(200);
        res.render('users', {
            title: 'User list',
            currentPage: page,
            totalPages: total,
            totalCount: totalCount,
            sizeofUsers: sizeofUsers,
            users: users,
            rowSize: rowSize,
            user: req.session.user,
            err: undefined
        });
    })();
});

router.get('/add', authHandler, adminHandler, (req, res) => {
    console.log("Getting form to add new user!");
    res.status(200);
    res.render('adduser', {
        title: "Add new user",
        user: req.session.user,
        err: undefined
    });
});

router.get('/:userid/books', authHandler, (req, res) => {
    console.log("Get books from specific user: ", parseInt(req.params.userid));

    (async() => {
        let specificUser = await User.getUserByUserid(parseInt(req.params.userid));
        let page = parseInt(req.query.page) || 1;
        const rowSize = 20;
        let books = await Book.getNBooks(rowSize, (page-1) * rowSize, specificUser.userid);
        let totalCount = Object.keys(books).length;
        let sizeofBooks = await Book.getBooksSize(parseInt(req.params.userid));
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
            specificUser: specificUser,
            err: undefined
        });
    })();
});

router.post('/', authHandler, adminHandler, (req, res) => {
    console.log("Logging user!");
    (async() => {
        let newUser = new User(req.body.username, req.body.password, req.body.location, req.body.age, req.body.email);
        newUser.role = req.body.role;

        let newUsername = await User.getUserByUsername(req.body.username);
        let newEmail = await User.getUserByEmail(req.body.email);

        if (newUsername.userid !== undefined) {
            let page = parseInt(req.query.page) || 1;
            const rowSize = 20;
            let users = await User.getNUsers(rowSize, (page-1) * rowSize);
            let totalCount = Object.keys(users).length;
            let sizeofUsers = await User.getUsersSize();
            let total = Math.ceil(sizeofUsers / rowSize);
            res.status(400);
            res.render('users', {
                title: 'User list',
                currentPage: page,
                totalPages: total,
                totalCount: totalCount,
                sizeofUsers: sizeofUsers,
                users: users,
                rowSize: rowSize,
                user: req.session.user,
                err: "Username already exists"
            });
            return;
        }

        if (newEmail.userid !== undefined) {
            let page = parseInt(req.query.page) || 1;
            const rowSize = 20;
            let users = await User.getNUsers(rowSize, (page-1) * rowSize);
            let totalCount = Object.keys(users).length;
            let sizeofUsers = await User.getUsersSize();
            let total = Math.ceil(sizeofUsers / rowSize);
            res.status(400);
            res.render('users', {
                title: 'User list',
                currentPage: page,
                totalPages: total,
                totalCount: totalCount,
                sizeofUsers: sizeofUsers,
                users: users,
                rowSize: rowSize,
                user: req.session.user,
                err: "E-mail already exists"
            });
            return;
        }

        let errmsg = undefined;
        try {
            await newUser.add();
        } catch(err) {
            errmsg = err;
            console.error(err);
        }

        let page = parseInt(req.query.page) || 1;
        const rowSize = 20;
        let users = await User.getNUsers(rowSize, (page-1) * rowSize);
        let totalCount = Object.keys(users).length;
        let sizeofUsers = await User.getUsersSize();
        let total = Math.ceil(sizeofUsers / rowSize);
        res.status(201);
        res.render('users', {
            title: 'User list',
            currentPage: page,
            totalPages: total,
            totalCount: totalCount,
            sizeofUsers: sizeofUsers,
            users: users,
            rowSize: rowSize,
            user: req.session.user,
            err: errmsg
        });
    })();
});

router.get('/edit/:userid', authHandler, adminHandler, (req, res) => {
    console.log("Editing user: ", parseInt(req.params.userid));

    (async() => {
        let specificUser = await User.getUserByUserid(parseInt(req.params.userid));
        res.status(200);
        res.render('edituser', {
            title: "Edit user",
            specificUser: specificUser,
            err: undefined,
            user: req.session.user
        });
    })();
});

router.delete('/:userid', authHandler, adminHandler, (req, res) => {
    console.log("Deleting user: ", parseInt(req.params.userid));

    (async () => {
        let user = await User.getUserByUserid(parseInt(req.params.userid));
        await user.delete();
        res.status(200);
        res.redirect('/api/users');
    })();
});

router.put('/:userid', authHandler, adminHandler, (req, res) => {
    console.log("Putting new user: ", req.params.userid);

    (async() => {
        let oldUser = await User.getUserByUserid(parseInt(req.params.userid));
        let newUser = new User(req.body.username, req.body.password, req.body.location, req.body.age, req.body.email);
        newUser.userid = parseInt(req.params.userid);
        newUser.role = req.body.role;

        console.log("Old user: ", oldUser);
        console.log("New user: ", newUser);

        try {
            await newUser.update();

            res.status(200);
            res.redirect('/api/users');
        } catch(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    })();
});

router.get('/:userid', authHandler, (req, res) => {
    console.log("Looking at user: ", parseInt(req.params.userid));
    (async() => {
        let specificUser = await User.getUserByUserid(parseInt(req.params.userid));
        res.render('user', {
            title: "User showcase",
            specificUser: specificUser,
            user: req.session.user
        });
    })();
});

module.exports = router;