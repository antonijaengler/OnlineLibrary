const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200);
    res.render('doc', {
        title: 'Documentation'
    });
});

module.exports = router;