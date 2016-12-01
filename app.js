require('app-module-path').addPath(__dirname);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var session = require('express-session');
var redis = require('connect-redis')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var register = require('./routes/register');
var lobby = require('./routes/lobby');
var diagram = require('./routes/diagram')

var app = express();

app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
            block = blocks[name] = [];
    }

    block.push(context.fn(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
        store: new redis({ logErrors: true }),
        secret: '4DFUOJtN9b8tz9hmRjfT',
        name: 'sessionId',
        secure: true,
        httpOnly: true,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 }
}));

app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/register', register);
app.use('/lobby', lobby);
app.use('/diagram', diagram)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


app.io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('message', function(message) {
        console.log(message);
        socket.emit('message', message);
    });
});

module.exports = app;