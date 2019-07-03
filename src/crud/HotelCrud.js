const Crud = require('./Crud');
const CityCrud = require('./CityCrud');
const Similarity = require('string-similarity');
const Hotel = require('../models/Hotels');
const {normalize} = require('../utils/utils');

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

        let oldEngine = oldData.engines.filter(e => e != null && newData.engine != null && e.name == newData.engine.name)[0];

        if (oldEngine == null)
            return false;

        return oldEngine.datas.filter(e =>
            e.from == newData.engine.datas[0].from &&
            e.to == newData.engine.datas[0].to &&
            e.adults == newData.engine.datas[0].adults &&
            e.children == newData.engine.datas[0].children
        )[0] != null
    }

    /**
     *
     * @param data
     * @param _data
     * @private
     */
    _getData(data, _data){
        let obj = _data.engines.filter(e => e != null && data.engine != null && e.name == data.engine.name)[0];

        if (_data.address == 'none' && data.address != 'none')
            _data.address = data.address;

        if (obj != null) {
            let _engine = _data.engines.filter(e => e != null && e.name == data.engine.name)[0];

            _engine.rate = data.engine.rate;
            _engine.reviews = data.engine.reviews;
            _engine.datas = _engine.datas.concat(data.engine.datas);
        } else
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
        let __data = Array.isArray(data.engine) ? this._getHotelArray(data, _data) : this._getData(data, _data);

        __data.engines = __data.engines.filter(e => e != null);

        return __data
    }

    /**
     *
     * @param data
     * @returns {Promise<{error: string} | never | any>}
     */
    create(data) {
        return this.getByName(data.name.toLowerCase()).then((_data) => {
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
     * @param from
     * @param to
     * @returns {Promise<any>}
     */
    mergeHotel(from, to)
    {
        if (String(from._id).localeCompare(String(to._id)) === 0)
            return null;

        from.engines = from.engines.concat(to.engines).filter(e => e != null);
        from.address = to.address;
        from.rate = to.rate > 0 ? to.rate : from.rate;

        from.engines = from.engines.filter(e => e != null);

        return this.deleteById(to).then(() => this.updateById(from))
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
     * @param cities
     * @returns {*}
     * @private
     */
    _removeAllCity(name, cities) {
        cities.forEach(e => name = name.replace(e.name.toLowerCase(), ''));

        return name;
    }

    /**
     *
     * @param name
     * @returns {Promise<any>}
     */
    getByName(name) {
        return CityCrud.getAll().then((cities) => {

            name = this._removeAllCity(normalize(name), cities);

            return this.getAll().then(e => {
                let names = e.map(i => this._removeAllCity(normalize(i.name), cities));
                let agv = Similarity.findBestMatch(name, names);
                let res = e.filter(i => this._removeAllCity(normalize(i.name), cities) === agv.bestMatch.target)[0];

                return new Promise((resolve, reject) =>
                    agv.bestMatch.rating > 0.81 ? resolve(res) : reject(Error("Not enough percent")));
            })
        })
    }

    /**
     *
     * @param city
     * @param array
     */
    getByCity(city, array) {
       return Promise.all(array.map(e => this.getByName(e)))
    }

    /**
     *
     * @param city
     * @param checkin
     * @param checkout
     */
    getByDateAndCity(city, checkin, checkout) {
       return CityCrud.getByName(city).then(e => this.getByDateAndCityId(e._id, checkin, checkout))
    }

    /**
     *
     * @param city
     * @param checkin
     * @param checkout
     * @returns {Promise<any | never>}
     */
    getByDateAndCityId(city, checkin, checkout) {
       return CityCrud.getById(city).then((doc) =>
           this.getAll({city: doc._id}).then(a => {
               a.forEach(b => b.engines.forEach(obj =>
                   obj.datas = obj.datas.filter(data =>
                       data.from == checkin && data.to == checkout
                   )
               ));

               return a
           }).catch(e => console.log(e))
       )
    }

    /**
     *
     * @param hotelsName {Array}
     * @returns {Promise<any>}
     */
    findCompetitor(hotelsName) {
        return this.find({name: {$in: hotelsName}})
    }

    /**
     *
     * @param data
     * @param _data
     * @returns {Promise<any>}
     */
    mergeData(data, _data) {
        return super.deleteById(_data).then(() => super.updateById(this._getHotel(data, _data)))
    }

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    getData(id) {
        return super.getById(id)
    }

}

/**
 *
 * @type {HotelCrud}
 */
module.exports = new HotelCrud();
