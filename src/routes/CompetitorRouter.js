const express = require('express');
const router = express.Router();
const HotelCrud = require('../crud/HotelCrud');
const CountryCrud = require('../crud/CountryCrud');
const {ERROR, sendHotels} = require('../utils/utils');

/**
 * Competitor
 *
 * Params: {
 *     name: String,
 *     rate: Number,
 *     competitors: [String]
 *     }
 *
 */
router.get('/competitor/:country/:city', (req, res) => {
    let data = req.body;

    CountryCrud.getByNameAndCity(req.params.country, req.params.city)
        .then(e =>
            HotelCrud.getByCity(e.city, data).then(e => {
                res.send(sendHotels(e, req.query.format))
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
 * Params: {
 *     name: String,
 *     rate: Number,
 *     competitors: [String]
 *     }
 *
 */
router.get('/competitor/:from/:to/:country/:city', (req, res) => {
    let data = req.body;

    CountryCrud.getByNameAndCity(req.params.country, req.params.city)
        .then(e => HotelCrud.getByCity(e.city, data).then(e => {
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
