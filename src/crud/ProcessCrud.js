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
        console.log(data);
        let name = data.name;
        data.running = true;

        return this.getByName(name).then((currentData) => {
            data._id = currentData._id;

            if (data.current >= data.max)
                return super.deleteById(data);

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

    getByNameAndCity(name, city) {
        return CityCrud.getByName(city).then((cityData) => {
          return this.getOne({name: name, city: cityData._id})
        }).catch(() => {
            return Promise.reject(true);
        });
    }

}

/**
 *
 * @type {ProcessCrud}
 */
module.exports = new ProcessCrud();
