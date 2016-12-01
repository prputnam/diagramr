var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var bcrypt = require('bcryptjs');
var db = require('db'); 

var router = express.Router();
var parser = bodyParser.urlencoded({ extended: false });

router.get('/', function(req, res, next) {
    res.render('register', { title: 'register' });
});

router.post('/', parser, function(req, res, next) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        db('users').insert({ email: req.body.email, password: hash }).then(function(data) {
            console.log(data);

            req.session.email = req.body.email;
            res.redirect('/lobby', 200);
        }).catch(function(err) {
            next(err);
        });
    });
});

module.exports = router;