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
     * @param data
     * @param scan
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     */
    setLastScan(data, scan) {
        return this.getByName(data.toLowerCase()).then((d) => super.update({
            ...d,
            lastScan: scan
        }))
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
