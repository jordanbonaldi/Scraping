const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CountryCrud = require('../crud/CountryCrud');
const {ERROR, sendHotels} = require('../utils/utils');

const actionToLoad = (countryCallback, hotelCallback, req, res) => {
    countryCallback
        .then(() =>
            hotelCallback.then(e =>
                res.send(sendHotels(e, req.query.format, req.params.from, req.params.to))
            ).catch(e => console.log(e))
        )
            .catch(e => res.send({
                ...ERROR,
                error: e
            }));
};

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/:country/:from/:to', (req, res) => {
    actionToLoad(CountryCrud.getByName(req.params.country), HotelCrud.getArray(req.body), req, res)
});

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/id/:country/:from/:to', (req, res) => {
    actionToLoad(CountryCrud.getByName(req.params.country), HotelCrud.getArrayID(req.body), req, res)
});

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/:from/:to/:country/:city', (req, res) => {
    actionToLoad(CountryCrud.getByNameAndCity(req.params.country, req.params.city), HotelCrud.getArray(req.body), req, res)
});

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/id/:from/:to/:country/:city', (req, res) => {
    actionToLoad(CountryCrud.getByNameAndCity(req.params.country, req.params.city), HotelCrud.getArrayID(req.body), req, res)
});

/**
 *
 * @type {Router|router}
 */
module.exports = router;
