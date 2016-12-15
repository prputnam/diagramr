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
    db.select('d.id AS diagramId', 'd.name', 'u.username AS createdByUsername', 'd.created_by AS createdById', 'd.diagram', 'd.locked_by AS lockedById')
            .from('diagrams AS d')
            .join('user_diagrams AS ud', 'd.id', '=', 'ud.diagram_id')
            .join('users AS u', 'ud.user_id', '=', 'u.id')
            .where('d.id', req.params.id)
            .andWhere('ud.user_id', req.session.userId)
            .first().then(function(data) {

        console. log(data)

        var user = { userId: req.session.userId, username: req.session.username };
        res.render('diagram', { user: user, diagram: data });
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
});

router.post('/:id/lock', function(req, res, next) {
    console.log('hit')

    var
    diagramId = req.params.id,
    lockedById = req.body.lockedById;

    if(lockedById == '') lockedById = null;
    console.log(lockedById)

    console.log(db('diagrams')
        .where('id', diagramId)
        .update('locked_by', lockedById).toString())

    db('diagrams')
        .where('id', diagramId)
        .update('locked_by', lockedById)
        .then(function(data) {

        res.end();
    });
});

router.post('/:id/addUsers', function(req, res, next) {
    console.log('hit')

    console.log(req.body)

    var
    diagramId = req.params.id,
    usernames = JSON.parse(req.body.usernames);

    console.log(usernames)

    db.from('user_diagrams')
        .insert(function() {
            this.from('users AS u')
                .whereIn('u.username', usernames)
                .select('id AS user_id', db.raw('? AS ??', [diagramId, 'diagram_id']))
        })
        .then(function(data) {


            res.end();
        });
});

module.exports = router;
