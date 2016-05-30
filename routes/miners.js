var express = require('express');
var router = express.Router();

// GET miner data
router.get('/', function(req, res) {
    res.json(req.json);
});

module.exports = router;
