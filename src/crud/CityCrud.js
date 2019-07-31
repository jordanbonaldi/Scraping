const Crud = require('./Crud');
const City = require('../models/Cities');
const {nameComparator} = require('../utils/utils');

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
        return nameComparator(name, this)
    }
}

/**
 *
 * @type {CityCrud}
 */
module.exports = new CityCrud();
