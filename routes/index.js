const express = require('express');
const router = express.Router();

/* GET home page. */
router.route('/:hotel').get((req, res) => {
  let title = req.params.hotel;
  res.send({
    toto: title
  });
});

module.exports = router;
