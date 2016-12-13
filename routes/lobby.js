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

router.post('/', function(req, res, next) {
    console.log(req.body);
    db('diagrams').returning('id', 'name').insert({ name: req.body.name, created_by: req.session.userId }).then(function (data) {

        var newDiagramId = data[0];
        db('user_diagrams').insert({ diagram_id: newDiagramId, user_id: req.session.userId }).then(function(data) {
            res.redirect('/diagram/' + newDiagramId);
        });
    });
});

module.exports = router;