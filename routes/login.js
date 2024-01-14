const express = require('express');
const User = require('../models/UserModel');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200);
    res.render('login', {
        title: "Login user",
        user: req.session.user,
        err: undefined
    });
});

router.post('/', (req, res) => {
    (async () => {
        if(req.session.user !== undefined) {
            res.status(400);
            res.render('login', {
                title: "Login user",
                user: req.session.user,
                err: "Please log out first"
            });
            return;
        }

        let user = await User.getUserByUsername(req.body.username);
        console.log("Logging user: ", user);
        let passcheck = user.checkPassword(req.body.password1);

        if(user.isPersisted() && passcheck) {
            req.session.user = user;
            res.status(200);
            res.redirect("/api/books");
        } else {
            res.status(400);
            res.render('login', {
                title: "Login user",
                user: req.session.user,
                err: "User does not exist or incorrect password."
            });
        }
    })();
});

module.exports = router;