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
                data: e,
                status: 0
            }))
        )
    )
});

const getEta = (processes) => {
    let sumHotels = processes.reduce((a, b) => a + b.current, 0);
    let sumMax = processes.reduce((a, b) => a + b.max, 0);

    let pct = Math.round((sumHotels*100)/sumMax);

    return {
        current: sumHotels,
        max: sumMax,
        pct: pct,
        eta: processes.reduce((a, b) => a + b.eta, 0),
        chunk: processes.reduce((a, b) => a + b.chunk, 0),
        perChunk: processes.reduce((a, b) => a + b.perChunk, 0),
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
