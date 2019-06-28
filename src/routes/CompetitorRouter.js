const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');
const CountryCrud = require('../crud/CountryCrud');
const {ERROR, sendHotels, getEta, isProcessRunning} = require('../utils/utils');

/**
 * Competitor
 *
 * Params: {
 *     name: String,
 *     rate: Number,
 *     competitors: [String]
 *
 */
router.get('/competitor/:from/:to/:country/:city', (req, res) => {
    let data = req.body;

    CountryCrud.getByNameAndCity(req.params.country, req.params.city);

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
