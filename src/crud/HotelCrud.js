const Crud = require('../crud/Crud');
const Hotel = require('../models/Hotels');

class HotelCrud extends Crud {
    constructor() {
        super('hotel', Hotel);
    }

    /**
     *
     * @param data
     * @returns {Promise<{error: string} | never | any>}
     */
    create(data) {
        let name = data.name;
        return this.getByName(name).then(() => {
            return {
                error: "Already existing hotel"
            }
        }).catch(() => {
            return super.create(data);
        })
    }

    /**
     *
     * @param hotel
     * @returns {Promise<any | never>}
     */
    getCityId(hotel) {
        return this.getOne(hotel).then((e) => {
            return e.city;
        })
    }

    /**
     *
     * @param name
     * @returns {Promise<any>}
     */
    getByName(name) {
        return this.getOne({name: name});
    }

}

/**
 *
 * @type {HotelCrud}
 */
module.exports = new HotelCrud();
