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
