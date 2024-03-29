var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var bcrypt = require('bcryptjs');
var db = require('db');

var router = express.Router();
var parser = bodyParser.urlencoded({ extended: false });

router.get('/', function(req, res, next) {
    if(req.session && req.session.username) {
        res.redirect('/lobby');
    } else {
        res.render('register', { title: 'register' });
    }
});

router.post('/', parser, function(req, res, next) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        db('users').insert({ email: req.body.email, password: hash, username: req.body.username }).then(function(data) {
            req.session.email = req.body.email;
            res.redirect('/lobby');
        }).catch(function(err) {
            next(err);
        });
    });
});

module.exports = router;