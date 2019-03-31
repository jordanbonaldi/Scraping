const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CityCrud = require('../crud/CityCrud');
const {load, engine} = require('../handlers/EnginesManager');

/**
 * Get hotels
 */
router.get('/hotels/get/', (req, res) => {
    console.log(engine.eta());
    res.send("eta : ");
});

/**
 * Create hotels
 */
router.post('/hotels/create/', (req, res) => {
    let hotel = req.body;

    CityCrud.getByName(hotel.city)
        .then((doc) => {
            return createHotel(hotel.name, doc._id, hotel.city)
        })
        .catch(() => {
            console.log("No city found with name " + hotel.city);
            return CityCrud.create({
                name: hotel.city,
            }).then(city => {
                return createHotel(hotel.name, city._id, hotel.city)
            })
        }).then(toSend => res.send(toSend));
});

/**
 *
 * @param name
 * @param id
 * @param city
 * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
 */
createHotel = (name, id, city) => {
    return HotelCrud.create({
        name: name,
        city: id
    }).then(created => {
        return CityCrud.addHotel(city, created).then(() => {
            return created.hasOwnProperty('error') ? created : created._doc
        })
    });
};

/**
 *
 * @type {Router|router}
 */
module.exports = router;
