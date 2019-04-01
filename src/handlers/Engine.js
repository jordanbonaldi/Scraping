const {Query} = require('./Query');
const $ = require('cheerio');
const SearchData = require('./SearchData');
const Generator = require('./Generator');
const City = require('../crud/CityCrud');
const Hotel = require('../crud/HotelCrud');
const request = require('request-promise');

class Engine {
    /**
     *
     * @param name
     * @param url
     * @param defaultUrl
     * @param queries
     */
    constructor(name, url, defaultUrl, ...queries) {
        this._name = name;
        this._url = url;
        this._defaultUrl = defaultUrl;
        this._query = new Query(...queries);
        this._city = null;
        this._time = 0;
        this._frequence = 0;
    }

    /**
     *
     * @returns {null|*}
     */
    get city() {
        return this._city;
    }

    /**
     *
     * @param value
     */
    set city(value) {
        this._city = value;
    }

    /**
     *
     * @returns {*}
     */
    get defaultUrl() {
        return this._defaultUrl;
    }

    /**
     *
     * @returns {*}
     */
    get url() {
        return this._url;
    }

    /**
     *
     * @returns {number|*}
     */
    get frequence() {
        return this._frequence;
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
     * @param data
     * @returns {Array}
     */
    parseSite(data = null) {
        return []
    }

    /**
     *
     * @param index
     * @param read
     * @returns {Number}
     */
    handleOffset(index = 0, read = 0) {
      return index * read;
    }

    /**
     *
     * @param schema
     * @param classes
     * @param data
     * @param digit
     * @returns {*}
     */
    getData(schema, classes, data, digit = 0) {
        let _data = $(schema + ' ' + classes, data);

        if (_data[0] == null ||
            _data[0].children == null ||
            _data[0].children[0] == null ||
            _data[0].children[0].data == null
        )
            return null;

        _data = _data[0].children[0].data;

        if (digit)
             _data = _data.match(/\d/g).join('');

        return _data
    }

    /**
     *
     * @param data
     * @returns {number}
     */
    getBasicInformation(data = null) {
        return 0
    }

    /**
     *
     * @returns {PromiseLike<string | never>}
     * @private
     */
    _getCookie() {
        let opt = {
            uri: this._defaultUrl,
            headers: {
              'cache-control': 'no-cache',
              'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
              'Accept': '*/*',
              'Connection': 'close',
            },
            resolveWithFullResponse: true
        };

        /**
         * Got all cookies
         */

        return request(opt)
            .then(response => {
                return response.caseless.dict['set-cookie']
            }).then((array) => {
                return array.map((e) =>
                    e.split(';')[0]
                )
            }).then((a) => {
                return a.join(';')
            })
    }

    /**
     *
     * @param max
     * @param read
     * @param index
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     * @private
     */
    _launchRequest(max, read = 0, index = 0) {
        let url = this._generator.addOffSet(this.handleOffset(index, read));
        return request(Engine._opt(url)).then((data) => {

            this._time = Date.now();

            let e = this.parseSite(data);

            let hotels = e.map(a => Hotel.create(a));

            return Promise.all(hotels).then(() => {
                read += e.length;

                this._time = Math.abs(this._time -= Date.now())/1000;

                this._frequence = this._time;

                console.log(this._name + " loading : " + read + "/" + max + " " + (((read*100)/max) | 0) + "%" + " in " + this._frequence + " seconds");

                if (max - read > 0)
                    return this._launchRequest(max, read, index + 1);
            })
        });
    }

    /**
     *
     * @param _url
     * @param cookies
     * @returns {{headers: {cookie: string, Accept: string, "User-Agent": string, Connection: string, "cache-control": string}, json: boolean, uri: *}}
     * @private
     */
    static _opt(_url, cookies) {
        return {
            uri: _url,
            headers: {
                'cookie': `${cookies}`,
                'cache-control': 'no-cache',
                'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
                'Accept': '*/*',
                'Connection': 'close'
            },
            json: true
        }
    }

    /**
     *
     * @param url
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     * @private
     */
    _request(url) {
        return this._getCookie().then((cookies) => {

            return request(Engine._opt(url, cookies)).then((data) => {
                let max = this.getBasicInformation(data);

                return this._launchRequest(max);
            })
        })
    }

    /**
     *
     * @param generator {Generator}
     * @param url
     * @returns {Promise|*|PromiseLike<any|never>|Promise<any|never>}
     */
    newGeneratorRequester(generator, url) {
        this._generator = generator;
        return this._request(url);
    }

    /**
     *
     * @param city {String}
     * @param checkin {Date}
     * @param checkout {Date}
     * @param adults {Number}
     * @param children {Number}
     * @param rooms {Number}
     * @param callback {CallableFunction}
     */
    search(
        city,
        checkin = null,
        checkout = null,
        adults = 1,
        children = 0,
        rooms = 1,
        callback = null
    ) {
        return City.getByName(city).then((e) => {
          this._city = e._id;
        }).then(() => {
            if (checkin === null)
                checkin = new Date();

            if (checkout === null) {
                checkout = new Date();
                checkout.setDate(checkin.getDate() + 1)
            }

            this._searchData = new SearchData(
                checkin,
                checkout,
                adults,
                children,
                rooms,
                city
            );

            this._generator = new Generator(this._url, this._searchData, this._query);

            this._generator.generateUrl(callback);

            return this._request(this._generator.baseUrl);
        })

    }

}

/**
 *
 * @type {Engine}
 */
module.exports = Engine;
