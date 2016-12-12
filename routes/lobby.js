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
    db.select('d.id', 'd.name')
            .from('user_diagrams AS ud')
            .join('diagrams AS d', 'ud.diagram_id', '=', 'd.id')
            .where('ud.user_id', req.session.userId)
            .then(function(data) {
        res.render('lobby', { userId: req.session.userId, username: req.session.username, diagrams: data });
    });
});

module.exports = router;
