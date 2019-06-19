const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');
const {ERROR, sendHotels, getEta, isProcessRunning} = require('../utils/utils');

/**
 * Competitor
 */
router.get('/competitor/:from/:to/:city', (req, res) => {
    CityCrud.getByName(req.params.city).then(doc => {
        isProcessRunning(doc._id).then(a => res.send(getEta(a)))
            .catch(() => HotelCrud.getByDateAndCity(req.params.city, req.params.from, req.params.to).then(e =>
                res.send(sendHotels(e))
            ))
    }).catch(() => res.send(ERROR))
});

/**
 *
 * @type {Router|router}
 */
module.exports = router;
