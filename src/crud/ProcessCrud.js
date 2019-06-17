const Crud = require('./Crud');
const Process = require('../models/Process');
const CityCrud = require('./CityCrud');

class ProcessCrud extends Crud {

    constructor() {
        super('Process', Process);
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    create(data) {
        let name = data.name;
        data.running = true;

        return this.getByNameAndCity(name, data.cityName, data.from, data.to).then((currentData) => {
            data._id = currentData._id;

            return super.updateById(data)
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

    /**
     *
     * @param name
     * @param city
     * @param checkin
     * @param checkout
     * @returns {Promise<any | never>}
     */
    getByNameAndCity(name, city, checkin, checkout) {
        return CityCrud.getByName(city).then((cityData) =>
            this.getOne({name: name, city: cityData._id, from: checkin, to: checkout})
        ).catch(() =>
            Promise.reject(true)
        )
    }

}

/**
 *
 * @type {ProcessCrud}
 */
module.exports = new ProcessCrud();
