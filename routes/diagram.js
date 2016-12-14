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

/* GET home page. */
router.get('/:id', function(req, res, next) {
    console.log(req.params.id);
    db.select('d.id AS diagramId', 'd.name', 'u.username AS createdByUsername', 'd.created_by AS createdById', 'd.diagram')
            .from('diagrams AS d')
            .join('user_diagrams AS ud', 'd.id', '=', 'ud.diagram_id')
            .join('users AS u', 'ud.user_id', '=', 'u.id')
            .where('d.id', req.params.id)
            .andWhere('ud.user_id', req.session.userId)
            .first().then(function(data) {

        console. log(data)
        res.render('diagram', { username: req.session.username, diagram: data });
    },
    function(err) {
        console.log(err)
    });
});

router.post('/:id', function(req, res, next) {
    var
    diagram = req.body.diagram,
    diagramId = req.params.id;

    db('diagrams')
        .where('id', diagramId)
        .update('diagram', diagram)
        .then(function(data) {

        res.end();
    });
})

module.exports = router;
