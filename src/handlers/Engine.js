const {Query} = require('./Query');
const $ = require('cheerio');
const SearchData = require('./SearchData');
const Generator = require('./Generator');
const City = require('../crud/CityCrud');
const Hotel = require('../crud/HotelCrud');
const request = require('request-promise');
const ProcessCrud = require('../crud/ProcessCrud');

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
        this._frequence = [];
        this._offset = [];
        this._max = 0;
        this._read = 0;
        this._now = 0;
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
     * @returns {Promise<any>}
     */
    updateSchema() {
        let offsetAver = Math.round(this._offset.reduce((a, b) => a + b, 0) / this._offset.length);
        let freqAver = Math.round(this._frequence.reduce((a, b) => a + b, 0) / this._frequence.length);

        let op = (this._max - this._read) / (offsetAver);


        return ProcessCrud.create({
            name: this._name,
            max: this._max,
            current: this._read,
            chunk: offsetAver,
            perChunk: this._now,
            index: this._index,
            freq: this._frequence,
            offsets: this._offset,
            city: this._city,
            eta: (this._frequence.length < 4 ? -1 : Math.round(op * freqAver * 1.8))
        });
    }

    /**
     *
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     * @private
     */
    _launchRequest() {
        let url = this._generator.addOffSet(this.handleOffset(++this._index, this._read));
        return request(Engine._opt(url)).then((data) => {

            this._now = Date.now();

            let e = this.parseSite(data);

            let hotels = e.map(a => Hotel.create(a));

            return Promise.all(hotels).then(() => {
                this._offset.push(e.length);
                this._read += e.length;

                this._now = Math.abs(this._now -= Date.now())/1000;

                this._frequence.push(this._now);

                console.log(
                    this._name + " loading : " +
                    this._read + "/" + this._max + " " +
                    (((this._read*100)/this._max) | 0) + "%" +
                    " in " +
                    this._now + " seconds"
                );

                return this.updateSchema().then(() => {
                    if (this._max - this._read > 0)
                        return this._launchRequest()
                })
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
     * @returns {Promise<T | boolean>}
     * @private
     */
    _getRunningProcess() {
        return ProcessCrud.getByName(this.name).then(doc => {
            this._max = doc.max;
            this._index = doc.index;
            this._read = doc.current;
            this._frequence = doc.freq;
            this._offset = doc.offsets;

            return true
        }).catch(() => false)
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
                return this._getRunningProcess().then(res => {
                    if (!res) {
                        this._max = this.getBasicInformation(data);
                        this._index = -1;
                    }

                    return this._launchRequest()
                })
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
        }).catch(() => City.create({
                name: city
            }).then(() => this.search(city, checkin, checkout, adults, children, rooms, callback))
        )
    }

}

/**
 *
 * @type {Engine}
 */
module.exports = Engine;
