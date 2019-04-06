const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');
const ProcessCrud = require('../crud/ProcessCrud');

/**
 * Get hotels
 */
router.get('/hotels/:city', (req, res) => {
    CityCrud.getByName(req.params.city).then(doc =>
        isProcessRunning(doc._id).then((a) => {
            return res.send(getEta(a))
        }).catch(() =>
            HotelCrud.getAll({city: doc._id}).then(e => res.send({
                ...e,
                status: 0
            }))
        )
    )
});

const getEta = (processes) => {

    let sumEta = processes.reduce((a, b) => a + b.eta, 0);
    let sumHotels = processes.reduce((a, b) => a + b.current, 0);
    let sumMax = processes.reduce((a, b) => a + b.max, 0);

    let pct = Math.round((sumHotels*100)/sumMax);

    return {
        current: sumHotels,
        max: sumMax,
        pct: pct,
        eta: sumEta,
        running: processes,
        status: 1
    }
};

const isProcessRunning = (id) => {
    return ProcessCrud.getAll({city: id})
};

/**
 *
 * @type {Router|router}
 */
module.exports = router;
