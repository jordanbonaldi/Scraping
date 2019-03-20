const Crud = require('../crud/Crud');
const Similarity = require('string-similarity');
const Hotel = require('../models/Hotels');

class HotelCrud extends Crud {
    constructor() {
        super('hotel', Hotel);
    }

    _compare(newData, oldData) {
        let oldEngine = oldData.engines.filter(e => e.name == newData.engine.name)[0];

        if (oldEngine == null)
            return false;

        return oldEngine.price === newData.engine.price
    }

    _getHotel(data, _data) {
        let obj = _data.engines.filter(e => e.name == newData.engine.name)[0];
        if (obj)
            _data.engines.filter(e => e.name == newData.engine.name)[0] = data.engine;
        else
            _data.engines.push(data.engine);

        return _data;
    }

    /**
     *
     * @param data
     * @returns {Promise<{error: string} | never | any>}
     */
    create(data) {
        let name = data.name;
        return this.getByName(name).then((_data) => {
            if (!this._compare(data, _data))
                return super.updateById(this._getHotel(data, _data));

            return {
                error: "Already existing hotel"
            }
        }).catch(() => {
            let obj = data.engine;
            delete data.engine;

            data.engines = [ obj ];
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
        return this.getAll().then(e => {
            console.log(e)
        })
    }

}

/**
 *
 * @type {HotelCrud}
 */
module.exports = new HotelCrud();
