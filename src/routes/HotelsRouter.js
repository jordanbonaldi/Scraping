const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');
const {ERROR, sendHotels, getEta, isProcessRunning} = require('../utils/utils');

/**
 * Get hotels
 */
router.get('/hotels/:city', (req, res) => {
    CityCrud.getByName(req.params.city).then(doc => {
        isProcessRunning(doc._id).then((a) => res.send(getEta(a)))
            .catch(() =>
                HotelCrud.getAll({city: doc._id}).then(e => res.send(sendHotels(e))))
    }).catch(() =>
        res.send(ERROR)
    )
});

/**
 * By Date And City
 */
router.get('/hotels/:from/:to/:city', (req, res) => {
    CityCrud.getByName(req.params.city).then(doc => {
        isProcessRunning(doc._id).then(a => res.send(getEta(a)))
            .catch(() => HotelCrud.getByDateAndCity(req.params.city, req.params.from, req.params.to).then(e =>
                res.send(sendHotels(e, req.query.format))
            ))
    }).catch(() => res.send(ERROR))
});

/**
 *
 * @type {Router|router}
 */
module.exports = router;
