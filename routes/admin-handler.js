function adminHandler(req, res, next) {
    console.log("Role of signed user: ", req.session.user.role);
    if(req.session.user.role !== 'admin') {
        req.session.err = "Not authorized to execute this action.";
        res.status(401);
        res.redirect('/api');
    }  else {
        next();
    }

}
module.exports = adminHandler;