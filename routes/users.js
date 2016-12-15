var express = require('express');
var router = express.Router();
var db = require('db');

router.use(function(req, res, next) {
    if(req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
});

router.get('/', function(req, res, next) {
    db.select('u.id AS userId', 'u.username')
        .from('users AS u')
        .then(function(data) {

        console.log(data);
        res.json(data);
    });
});

module.exports = router;
