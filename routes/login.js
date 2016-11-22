var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var bcrypt = require('bcryptjs');
var knex = require('knex')({
    client: 'pg',
    connection: 'postgres://postgres:postgres@localhost:5432/test',
    searchPath: 'public'
});

var router = express.Router();
var parser = bodyParser.urlencoded({ extended: false });


/* GET login listing. */
router.get('/', function(req, res, next) {
    if(req.session) {
        console.log('has session');
        console.log(req.session);
    } else {
        console.log('no session')
    }

    res.render('login', {title: 'Login', body: '<p>Login page</p>'});
});


// TODO: set sessions
router.post('/', parser, function(req, res, next) {
    knex.select().from('users').where({ email: req.body.email }).first().then(function(data) {
        bcrypt.compare(req.body.password, data.password, function(err, success) {
            if(err) next(err);
            if(success) {
                console.log('successful login')
                req.session.email = req.body.email;

                console.log(req.session.email);

                res.send('successful')
            } else {
                res.send('failed')
            }
        });
    }).catch(function(error) {
        res.status(500).render('login', { title: 'Login', body: '<p>Login page</p>', failedLogin: true });
    });
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'register' });
});

router.post('/register', parser, function(req, res, next) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        knex('users').insert({ email: req.body.email, password: hash }).then(function(data) {
            console.log(data);
            res.send('Added user: ' + data.email);
        }).catch(function(err) {
            next(err);
        });
    });
});

module.exports = router;
