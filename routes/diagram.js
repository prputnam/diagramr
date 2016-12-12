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
    db.select('d.name')
            .from('diagrams AS d')
            .join('user_diagrams AS ud', 'd.id', '=', 'ud.diagram_id')
            .where('d.id', req.params.id)
            .andWhere('ud.user_id', req.session.userId)
            .first().then(function(data) {
        res.send("Found " + data.name);
    },
    function(err) {
        console.log(err)
    });
});

module.exports = router;
