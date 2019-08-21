const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CountryCrud = require('../crud/CountryCrud');
const {ERROR, sendHotels} = require('../utils/utils');

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/:country/:city/:from/:to', (req, res) => {
    let data = req.body;

    CountryCrud.getByNameAndCity(req.params.country, req.params.city)
        .then(e =>
            HotelCrud.getArray(data).then(e => {
                res.send(sendHotels(e, req.query.format, req.params.from, req.params.to))
            }).catch(e => console.log(e))
        )
        .catch(e => res.send({
            ...ERROR,
            error: e
        }));
});

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/:country/:from/:to', (req, res) => {
    let data = req.body;

    CountryCrud.getByName(req.params.country)
        .then(() =>
            HotelCrud.getArray(data).then(e =>
                res.send(sendHotels(e, req.query.format, req.params.from, req.params.to))
            ).catch(e => console.log(e))
        )
        .catch(e => res.send({
            ...ERROR,
            error: e
        }));
});

/**
 * Competitor
 *
 * Params: [String]
 *
 */
router.get('/competitor/:from/:to/:country/:city', (req, res) => {
    let data = req.body;

    CountryCrud.getByNameAndCity(req.params.country, req.params.city)
        .then(e => HotelCrud.getArray(data).then(e => {
            e.forEach(a => {
                a.engines.forEach(eg => {
                    eg.datas = eg.datas.filter(data =>
                        data.from == req.params.from && data.to == req.params.to
                    )
                })
            });
            res.send(sendHotels(e, req.query.format))
        }).catch(e => console.log(e)))
        .catch(e => res.send({
            ...ERROR,
            error: e
    }));
});

/**
 *
 * @type {Router|router}
 */
module.exports = router;
