const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

router.get('/', (req, res) => {
    res.status(200);
    res.render('signup', {
        title: "Register new user",
        user: req.session.user,
        err: undefined
    });
});

router.post('/', (req, res) => {
    (async () => {
        if(req.body.password1 !== req.body.password2) {
            res.status(400);
            res.render('signup', {
                title: "Register new user",
                user: req.session.user,
                err: "Passwords not the same!"
            });
            return;
        }

        let username = req.body.username;
        let email = req.body.email;
        
        let newUsername = await User.getUserByUsername(username);
        let newEmail = await User.getUserByEmail(email);

        if (newUsername.userid !== undefined) {
            res.status(400);
            res.render('signup', {
                title: 'Register a new user',
                user: req.session.user,
                err: "Username already exists"
            });
            return;
        }

        if (newEmail.userid !== undefined) {
            req.status(400);
            res.render('signup', {
                title: 'Register a new user',
                user: req.session.user,
                err: "Email already exists"
            });
            return;
        }

        let user = new User(username, req.body.password1, req.body.city + ', ' + req.body.country, req.body.age, req.body.email);
        await user.add();

        console.log(user);

        if(user) {
            req.session.user = user;
            res.status(201);
            res.redirect("/api/books");
        }
    })();
});

module.exports = router;