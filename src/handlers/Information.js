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
     * @param searchClass
     * @param queryClass
     * @param queries
     */
    constructor(name, url, searchClass, queryClass, ...queries) {
        this._name = name;
        this._url = url;
        this._query = new queryClass(...queries);
        this._search = new searchClass();
        this._currentHotelIndex = null;
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
     * @returns {PromiseLike<any[] | never>}
     */
    getUrl(name) {
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

    /**
     *
     */
    loadProcedure() {
        return this._loadHotels().then(hotels => {
            // return Promise.all(hotels.map(e => {
                let e = hotels[0];
                console.log(e)
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

                        promiseUrl = this.getUrl(e.name.toLowerCase());
                    }

                    return promiseUrl.then((url) => {
                        if (url == null) {
                            console.log("No address found for " + e.name);
                            return;
                        }

                        return request(url).then(this.getInformations).then((data) => {
                            e.address = data.address != null ? data.address : e.address;
                            e.rate = data.rate != null ? data.rate : e.rate;

                            console.log(e.name + " updated -> address:" + e.address + " rate: " + e.rate);

                            return Hotel.updateById(e);
                        })
                    })
                })
            // })).then(() => {
            //     console.log("done")
            // })
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
