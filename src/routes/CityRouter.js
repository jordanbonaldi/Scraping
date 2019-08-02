const express = require('express');
const router = express.Router();
const CityCrud = require('../crud/CityCrud');
const CountryCrud = require('../crud/CountryCrud');
const {ERROR} = require('../utils/utils');

/**
 * Get City
 *
 */
router.get('/city/:country/:city', (req, res) => {
    CountryCrud.getByNameAndCity(req.params.country, req.params.city)
        .then(e => CityCrud.getById(e.city).then(e => res.send({
            ...e._doc,
            status: 0
        })))
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
