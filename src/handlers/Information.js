const {Query} = require('./Query');
const City = require('../crud/CityCrud');
const Hotel = require('../crud/HotelCrud');
const request = require('request-promise');
const Generator = require('../handlers/Generator');
const ProcessCrud = require('../crud/ProcessCrud');

class Information
{
    /**
     *
     * @param name
     * @param url
     * @param hotel_type
     * @param city_type
     * @param hotel_type
     * @param city_type
     * @param searchClass
     * @param queryClass
     * @param queries
     */
    constructor(name, url, hotel_type, city_type, searchClass, queryClass, ...queries) {
        this._name = name;
        this._url = url;
        this._query = new queryClass(...queries);
        this._search = new searchClass();
        this._currentHotelIndex = null;
        this._hotel_type = hotel_type;
        this._city_type = city_type;
    }

    /**
     *
     * @returns {*}
     */
    get name() {
        return this._name;
    }

    /**
     *
     * @returns {*}
     */
    get search() {
        return this._search;
    }

    /**
     *
     * @returns {Hotels}
     */
    get currentHotelIndex() {
        return this._currentHotelIndex;
    }

    /**
     *
     * @returns {Generator}
     */
    get generator() {
        return this._generator;
    }

    /**
     *
     * @returns {Promise<any>}
     */
    _loadHotels() {
        return Hotel.getAll({address: 'none'})
    }

    /**
     *
     * @param engine
     * @returns {boolean|number}
     * @private
     */
    _actionToPerform(engine) {
        return engine != null && engine.hasOwnProperty('id') && engine.id > 0 ? engine.id : false
    }

    /**
     *
     * @param hotel
     * @returns {T}
     * @private
     */
    _getCorrespondingEngine(hotel) {
        return hotel.engines.filter(e => e.name.toLowerCase() == this._name.toLowerCase())[0];
    }

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    getUrlFromId(id) {
        return new Promise((resolve, reject) => reject(true))
    }

    /**
     *
     * @param name
     * @param type
     * @returns {PromiseLike<any[] | never>}
     */
    getUrl(name, type) {
        return new Promise((resolve, reject) => reject(true))
    }

    /**
     *
     * @param hotels
     * @param selected
     * @param name
     */
    setAllpromise(hotels, selected, name) {
        return new Promise((resolve, reject) => reject(true))
    }

    _clone(obj) {
        if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        let temp = new obj.constructor();

        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = this._clone(obj[key]);
                delete obj['isActiveClone']
            }
        }

        return temp
    }

    getUnique(arr, comp) {
        return arr.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => arr[e]).map(e => arr[e])
    }

    /**
     *
     * @param promise
     * @param hotel
     * @param callback
     * @returns {Promise<T | never>}
     * @private
     */
    _loadUrl(promise, hotel, callback) {
        return promise.then((url) => {
            if (url == null) {
                console.log("No address found for " + hotel.name);
                return callback();
            }

            return request(url).then(this.getInformations).then((data) => {
                hotel.address = data.address != null ? data.address : hotel.address;
                hotel.rate = data.rate != null ? data.rate : hotel.rate;

                console.log(hotel.name + " updated -> address:" + hotel.address + " rate: " + hotel.rate);

                return Hotel.updateById(hotel).then(() => {
                    return callback();
                })
            })
        }).catch((e) => {
            console.log('Error while loading ' + hotel.name + ' ' + e);
            return callback()
        })
    }

    /**
     *
     * @param name
     * @returns {PromiseLike<any[]|never>}
     */
    loadCity(name) {
        this._search.search(name.toLowerCase() + ' France');

        this._generator = new Generator(
            this._url,
            this._search,
            this._clone(this._query)
        );

        return this.getUrl(name, this._city_type).then((e) => e.array)
            .then((array) => {
                if (array.length === 0)
                    throw 'City "' + name + '" doesn\'t exists';

                let data = array.filter(e => e.caption.toLowerCase().includes(name.toLowerCase()))[0]

                if (data == null)
                    throw 'City "' + name + '" doesn\'t exists';
            })
    }

    /**
     *
     * Recursive system
     *
     * @param hotels
     * @param index
     * @returns {Promise<any | never>}
     */
    loadHotel(hotels, index = 0) {

        let next = () => this.loadHotel(hotels, ++index);

        if (index >= hotels.length)
            return;

        let e = hotels[index];

        return City.getById(e.city).then(city => {
            let engine = this._getCorrespondingEngine(e);
            let promiseUrl, id;

            this._currentHotelIndex = e;

            if ((id = this._actionToPerform(engine))) promiseUrl = this.getUrlFromId(id);
            else {
                this._search.search(e.name.toLowerCase() + ' ' + city.name + ' France');

                this._generator = new Generator(
                    this._url,
                    this._search,
                    this._clone(this._query)
                );


                promiseUrl = this.getUrl(e.name.toLowerCase(), this._hotel_type).then((obj) => {
                    return this.setAllpromise(obj.array, obj.selected, obj.name)
                })
            }

            return this._loadUrl(promiseUrl, e, next);
        })
    }

    /**
     *
     */
    loadProcedure() {
        return this._loadHotels().then(hotels => {
            return this.loadHotel(hotels)
        })
    }

    /**
     *
     * @param data
     * @returns {{address: *, rate: string}}
     */
    getInformations(data) {
        return {
            address: 'none',
            rate: '0'
        }
    }
}

/**
 *
 * @type {Information}
 */
module.exports = Information;
