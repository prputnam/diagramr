var express = require('express');
var bcrypt = require('bcryptjs');
var db = require('db');

var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session && req.session.email) {
        console.log('has session');
        console.log(req.session);
    } else {
        console.log('no session')
    }

    res.render('login', {title: 'Login', body: '<p>Login page</p>'});
});

router.post('/', function(req, res, next) {
    if(req.body.email && req.body.password) {
        db.select().from('users').where({ email: req.body.email }).first().then(function(data) {
            bcrypt.compare(req.body.password, data.password, function(err, success) {
                if(err) next(err);

                if(success) {
                    req.session.userId = data.id;
                    res.redirect('/lobby');
                } else {
                    res.status(500).render('login', { title: 'Login', body: '<p>Login page</p>', failedLogin: true });
                }
            });
        });
    } else {
        res.status(500).render('login', { title: 'Login', failedLogin: true, message: 'Must supply username and password.' });
    }
});

module.exports = router;