const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');

/**
 * Get hotels
 */
router.route('/get/:hotel').get((req, res) => {
    let name = req.params.hotel;
    HotelCrud.getByName(name).then(data => {
        res.send(data);
    }).catch((err) => {
        res.send({error: err})
    })
});

/**
 * Create hotels
 */
router.route('/create/:hotel').get((req, res) => {
    let title = req.params.hotel;

    HotelCrud.create({
        title: title
    }).then((doc) => { res.send(doc) })
});

module.exports = router;
