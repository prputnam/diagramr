var express = require('express');
var router = express.Router();
var db = require('db');

router.use(function(req, res, next) {
    if(req.session.userId) {
        next();
    } else {
        res.redirect('login');
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    db.select('diagram.id', 'diagram.name').from('user_diagram').join('diagram', 'user_diagram.diagram_id', '=', 'diagram.id').where('user_diagram.user_id', req.session.userId).then(function(data) {
        res.render('lobby', { userId: req.session.userId, diagrams: data });
    });
});

module.exports = router;
