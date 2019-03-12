const Crud = require('../crud/Crud');
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
     * @param hotel
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     */
    addHotel(city, hotel) {
        return this.getByName(city).then((data) => {
            data.hotels.push(hotel._id);

            return this.update(data, {name: city});
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
