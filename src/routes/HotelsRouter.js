const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');

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

    CityCrud.getByName('nice').then((doc) => {
        console.log(doc);
        HotelCrud.create({
            title: title,
            city: doc._id
        }).then((d) => {
            CityCrud.addHotel('nice', d).then((z) => {
                res.send(z)
            })
        }).catch(e => {
            console.log(e);
        })
    })
});

module.exports = router;
