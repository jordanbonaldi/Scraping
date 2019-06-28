const Crud = require('./Crud');
const CityCrud = require('./CityCrud');
const Country = require('../models/Countries');
const {normalize} = require('../utils/utils');
const Similarity = require('string-similarity');

class CountryCrud extends Crud {

    constructor() {
        super('country', Country);
    }

    /**
     *
     * @returns {Promise<{error: string} | any>}
     * @param name
     */
    create(name) {
        return this.getByName(name).then(() => {
            return { error: "Already existing city" }
        }).catch(() =>
            super.create({
                name: name,
                cities: []
            })
        )
    }

    /**
     *
     * @param name
     * @param city
     * @returns {Promise<any | {error: string} | never>}
     */
    addCity(name, city) {
        return this.getByName(name).then((doc) =>
            CityCrud.getByName(city).then((e) => {
                e.country = doc._id;
                let city = doc.cities.filter(a => String(a).localeCompare(String(e._id)) === 0)[0];

                if (city != null)
                    return;

                doc.cities.push({
                    name: e.name,
                    city: e._id
                });

                return CityCrud.updateById(e).then(() => this.updateById(doc))
            }).catch(() =>
                CityCrud.create({name: city}, "countrycrud:48").then(() => this.addCity(name, city))
            )
        )
    }

    getByNameAndCity(name, city) {
        return this.getByName(name).then(country =>
            country.cities.filter(e => Similarity.compareTwoStrings(e.name, city) > 0.7)[0]
        )
    }

    /**
     *
     * @param name
     * @returns {Promise<any>}
     */
    getByName(name) {
        return this.getAll().then(e => {
            let names = e.map(i => normalize(i.name));
            let agv = Similarity.findBestMatch(normalize(name), names);
            let res = e.filter(i => normalize(i.name) === agv.bestMatch.target)[0];

            return new Promise((resolve, reject) =>
                agv.bestMatch.rating > 0.81 ? resolve(res) : reject(Error("Not enough percent")));
        })
    }

    /**
     *
     * @param country
     * @param city
     * @param engine
     * @returns {Promise<any | never>}
     */
    setLastScan(country, city, engine) {
        return this.getByName(country.name).then(doc =>
            this.updateById({
                ...doc._doc,
                lastScan: {
                    city: city,
                    engine: engine
                }
            })
        )
    }

    /**
     *
     * @param country
     * @param city
     * @returns {Promise<boolean | never>}
     */
    hasCity(country, city) {
        return CityCrud.getByName(city).then((doc) =>
            this.getByName(country).then((country) => country.cities.filter(e => String(e.city).localeCompare(doc._id) === 0) != null)
        ).catch(() => false)
    }

}

/**
 *
 * @type {CountryCrud}
 */
module.exports = new CountryCrud();
