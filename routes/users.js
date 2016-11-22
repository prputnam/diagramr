var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Users', body: '<p>Users page</p>'});
});

module.exports = router;
