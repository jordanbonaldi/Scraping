const Crud = require('./Crud');
const City = require('../models/Cities');

class CityCrud extends Crud {

    constructor() {
        super('city', City);
    }

    /**
     *
     * @param data
     * @returns {Promise<T | never>}
     */
    create(data) {
        let name = data.name;
        data.hotels = [];
        return this.getByName(name).then(() => {
            return {
                error: "Already existing city"
            }
        }).catch(() => {
            return super.create(data);
        })
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
     */
    getByName(name) {
        return this.getOne({name: name});
    }

}

/**
 *
 * @type {CityCrud}
 */
module.exports = new CityCrud();
