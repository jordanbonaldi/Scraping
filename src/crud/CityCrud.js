const Crud = require('./Crud');
const City = require('../models/Cities');
const {normalize} = require('../utils/utils');
const Similarity = require('string-similarity');

class CityCrud extends Crud {

    constructor() {
        super('city', City);
    }

    /**
     *
     * @param data
     * @returns {Promise<{error: string} | any>}
     */
    create(data, where) {
        let name = data.name;
        data.hotels = 0;
        data.where = where;

        return this.getByName(name).then(() => {
            return { error: "Already existing city" }
        }).catch(() =>
            super.create(data)
        )
    }

    /**
     *
     * @param city
     * @param scan
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     */
    setLastScan(city, scan) {
        return this.getByName(city.toLowerCase()).then((d) => {
            return super.updateById({
                ...d._doc,
                lastScan: scan
            });
        })
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
}

/**
 *
 * @type {CityCrud}
 */
module.exports = new CityCrud();
