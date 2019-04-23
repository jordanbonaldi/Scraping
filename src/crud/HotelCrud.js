const Crud = require('./Crud');
const Similarity = require('string-similarity');
const Hotel = require('../models/Hotels');

class HotelCrud extends Crud {

    constructor() {
        super('hotel', Hotel);
    }

    /**
     *
     * @param newData
     * @param oldData
     * @returns {boolean}
     * @private
     */
    _compare(newData, oldData) {
        if (Array.isArray(newData.engine))
            return false;

        let oldEngine = oldData.engines.filter(e => e.name == newData.engine.name)[0];

        if (oldEngine == null)
            return false;

        return oldEngine.price === newData.engine.price
    }

    /**
     *
     * @param data
     * @param _data
     * @private
     */
    _getData(data, _data){
        let obj = _data.engines.filter(e => e.name == data.engine.name)[0];

        if (_data.address == 'none' && data.address != 'none')
            _data.address = data.address;

        if (obj != null)
            _data.engines.filter(e => e.name == data.engine.name)[0] = data.engine;
        else
            _data.engines.push(data.engine);

        return _data;
    }

    /**
     *
     * @param data
     * @param _data
     * @private
     */
    _getHotelArray(data, _data) {
        data.engine.forEach(e => {
            let hotel = {
                name: data.name,
                address: data.address,
                city: data.city,
                engine: e
            };

            _data = this._getData(hotel, _data);
        });

        return _data
    }

    /**
     *
     * @param data
     * @param _data
     * @returns {*}
     * @private
     */
    _getHotel(data, _data) {
        if (Array.isArray(data.engine))
            return this._getHotelArray(data, _data);

        return this._getData(data, _data);
    }

    /**
     *
     * @param data
     * @returns {Promise<{error: string} | never | any>}
     */
    create(data) {
        return this.getByName(data.name).then((_data) => {
            if (!this._compare(data, _data))
                return super.updateById(this._getHotel(data, _data));

            return { error: 'Already existing hotel' }
        }).catch(() => {
            let obj = [];

            if (Array.isArray(data.engine))
                obj = data.engine;
            else obj = [ data.engine ];

            delete data.engine;

            data.engines = obj;

            return super.create(data)
        })
    }

    /**
     *
     * @param hotel
     * @returns {Promise<any | never>}
     */
    getCityId(hotel) {
        return this.getOne(hotel).then((e) => e.city)
    }

    /**
     *
     * @param name
     * @returns {Promise<any>}
     */
    getByName(name) {
        return this.getAll().then(e => {
            let names = e.map(i => i.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
            let agv = Similarity.findBestMatch(name.normalize('NFD').replace(/[\u0300-\u036f]/g, ""), names);
            let res = e.filter(i =>
                i.name.toLowerCase().normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, "") === agv.bestMatch.target)[0];

            return new Promise((resolve, reject) => agv.bestMatch.rating > 0.81 ? resolve(res) : reject(true));
        })
    }

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    getData(id) {
        return super.getById(id);
    }

}

/**
 *
 * @type {HotelCrud}
 */
module.exports = new HotelCrud();
