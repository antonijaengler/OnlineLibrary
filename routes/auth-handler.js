function authHandler(req, res, next) {
    if (req.session.user === undefined) {
        req.session.err = "Please login to view the requested page."
        req.session.save(() => {
            res.status(401);
            res.render('login', {
                title: "Login user",
                user: req.session.user,
                err: req.session.err
            });
        });
    } else {
        next();
    }

}
module.exports = authHandler;