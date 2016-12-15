var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session && req.session.username) {
        res.redirect('/lobby');
    } else {
        res.render('login', {title: 'Login', body: '<p>Login page</p>'});
    }
});

router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
