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
    db.select('diagram.name')
            .from('diagram')
            .join('user_diagram', 'diagram.id', '=', 'user_diagram.diagram_id')
            .where('diagram.id', req.params.id)
            .andWhere('user_diagram.user_id', req.session.userId)
            .first().then(function(data) {
        res.send("Found " + data.name);
    },
    function(err) {
        console.log(err)
    });
});

module.exports = router;
