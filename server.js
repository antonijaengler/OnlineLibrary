const express = require('express');
const app = express();
const PORT = 8000;
var path = require('path');
const swagger = require('swagger-ui-express');
const session = require('express-session');

// parsing json
app.use(express.json());

// set up documentation
const doc = require('./documentation/swagger-doc.json');

// connect with REST
//const docRouter = require('./routes/doc');
const homeRouter = require('./routes/home');
const booksRouter = require('./routes/books');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const usersRouter = require('./routes/users');

// set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set styles
app.use(express.static(path.join(__dirname, 'public')));

// set session middleware
app.use(session({
    secret: 'some-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'library-cookie',
        secure: false, 
        httpOnly: true,
        maxAge: 3600000, 
      },
}));

// add routing
app.use(express.urlencoded({ extended: true}));
app.use('/api', homeRouter);
app.use('/api/books', booksRouter);
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/users', usersRouter);
app.use('/', swagger.serve, swagger.setup(doc));

app.listen(
    PORT, 
    () => console.log(`it's alive on http://localhost:${PORT}/`)
);

module.exports = app;