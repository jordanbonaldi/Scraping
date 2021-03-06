const {Query} = require('./Query');
const $ = require('cheerio');
const SearchData = require('./SearchData');
const Generator = require('./Generator');
const City = require('../crud/CityCrud');
const Country = require('../crud/CountryCrud');
const Hotel = require('../crud/HotelCrud');
const request = require('request-promise');
const ProcessCrud = require('../crud/ProcessCrud');
const fs = require('fs');
const InformationsManager = require('../handlers/InformationsManager');
const {normalize, log, getDate} = require('../utils/utils');
const StringComparator = require('string-similarity');

class Engine {
    /**
     *
     * @param name
     * @param url
     * @param defaultUrl
     * @param cookieFile
     * @param queries
     */
    constructor(name, url, defaultUrl, cookieFile, ...queries) {
        this._name = name;
        this._url = url;
        this._defaultUrl = defaultUrl;
        this._city = null;
        this._country = null;
        this._cookieFile = cookieFile;
        this._stockQueries = queries;
        this._eraseData();
    }

    get country() {
        return this._country;
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
     * @returns {any.name|*}
     */
    get cityName() {
        return this._cityName
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

    get frequence() {
        return this._frequence;
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    parseSite(data = null) {
        return new Promise((resolve, reject) => reject(true))
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
     * @param data
     * @returns {*}
     */
    setOffset(data = null) {
        return null
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
     * @returns {Promise<any>}
     */
    getBasicInformation(data = null) {
        return new Promise((resolve, reject) => reject(true));
    }

    /**
     *
     * @private
     */
    _eraseData() {
        this._query = new Query(...this._stockQueries);
        this._frequence = [];
        this._offset = [];
        this._max = 0;
        this._read = 0;
        this._falseRead = 0;
        this._now = 0;
        this._totalFalse = 0;
        this._cookieData = null;
        this._setOffset = null;
        this._setOffsetCount = 0;
        this._check_in = null;
        this._check_out = null;
        this._adults = 0;
        this._children = 0;
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
            .then(response => this._cookieData ? this._cookieData : Promise.resolve(response.caseless.dict['set-cookie'])
                .then((array) => array.map((e) => e.split(';')[0])
                ).then((a) => a.join(';')
                ).then((a) =>
                    this._cookieFile ?
                        (this._cookieData = fs.readFileSync(this._cookieFile, 'utf8').replace(/(\r\n|\n|\r)/gm, ""))
                        : a
                )
            )
    }

    /**
     * Increment read
     */
    incrRead() {
        {
            this._falseRead++;
            this._totalFalse++;
        }
    }

    getFrequences() {
        return this._frequence.reduce((a, b) => a + b, 0)
    }

    getOffset() {
        return this._offset.reduce((a, b) => a + b, 0)
    }

    getEta() {
        let offsetAver = this.getOffset() / this._offset.length;
        let freqAver =  this.getFrequences() / this._frequence.length;
        let op = (this._max - this._read) / (offsetAver);

        return this._frequence.length < 4 ? -1 : Math.round(op * freqAver * 1.8);
    }

    /**
     *
     * @returns {Promise<any>}
     */
    updateSchema() {
        let offsetAver = Math.round( this.getOffset() / this._offset.length);
        let freqAver = Math.round( this.getFrequences() / this._frequence.length);

        let op = (this._max - this._read) / (offsetAver);

        return ProcessCrud.create({
            name: this._name.trim().toLowerCase(),
            max: this._max,
            current: this._read,
            chunk: offsetAver,
            perChunk: this._now,
            index: this._index,
            freq: this._frequence,
            offsets: this._offset,
            status: 1,
            country: this._country,
            data: 'none',
            city: this._city,
            from: getDate(this._check_in),
            to: getDate(this._check_out),
            notPushed: this._totalFalse,
            cityName: this._cityName,
            setOffset: this._setOffset,
            eta: (this._frequence.length < 4 ? -1 : Math.round(op * freqAver * 1.8))
        });
    }

    /**
     *
     * @param engine
     * @returns {{datas: {children: number, price: (*|String|StringConstructor|string), adults: number, from: *, to: *}[]}|null}
     * @private
     */
    _addDateInformation(engine) {
        if (engine == null || engine.price == null)
            return null;

        engine = {
            ...engine,
            datas: [{
                from: getDate(this._check_in),
                to: getDate(this._check_out),
                adults: this._adults,
                children: this._children,
                price: engine.price,
            }]
        };
        delete engine.price;

        return engine;
    }

    /**
     *
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     * @private
     */
    _launchRequest(oldData) {
        if (this._setOffsetCount !== 0)
            this._setOffset = this.setOffset(oldData);
        this._setOffsetCount++;

        let url = this._setOffset ? this._url + this._setOffset : this._generator.addOffSet(this.handleOffset(++this._index, this._read));

        return request(Engine._opt(url, this._cookieData)).then((data) => {
            this._now = Date.now();

            return this.parseSite(data).then(e => {
                if (e == null)
                    return;

                e.forEach(a => {
                    if (Array.isArray(a.engine) || Array.isArray(a.engines)) {
                        if (Array.isArray(a.engines)) {
                            a.engine = a.engines;
                            delete a.engines;
                        }

                        for (let i = 0; i < a.engine.length; i++)
                            a.engine[i] = this._addDateInformation(a.engine[i]);
                    } else
                        a.engine = this._addDateInformation(a.engine);

                });

                let hotels = e.map(a => Hotel.create(a));

                return Promise.all(hotels).then(() => {
                    this._offset.push(e.length);
                    this._read += e.length;
                    this._read += this._falseRead;
                    this._falseRead = 0;

                    this._now = Math.abs(this._now -= Date.now())/1000;

                    this._frequence.push(this._now);

                    log(
                        this._name + " loading : " +
                        this._read + "/" + this._max + " " +
                        (((this._read * 100) / this._max) | 0) + "%" +
                        " in " +
                        this._now + " seconds -> with " + this._totalFalse + " not pushed. | " + this.getEta() + " seconds remaining.."
                    );

                    return this.updateSchema().then(() => {
                        if (this._max - this._read > 0)
                            return this._launchRequest(data)
                    })
                })
            })
        }).catch(e => console.log(e))
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
            json: true,
        }
    }

    /**
     *
     * @returns {Promise<T | boolean>}
     * @private
     */
    _getRunningProcess() {
        return ProcessCrud.getByNameAndCity(
            this.name.trim().toLowerCase(),
            this._cityName.toLowerCase(),
            this._check_in, this._check_out
        ).then(doc =>
            Country.getById(doc.country).then(() => {
                this._max = doc.max;
                this._index = doc.index;
                this._read = doc.current;
                this._frequence = doc.freq;
                this._offset = doc.offsets;
                this._setOffset = doc.setOffset;
                this._totalFalse = doc.notPushed;
                this._country = doc.country;

                return true
            })
        ).catch(() => false)
    }

    /**
     *
     * @returns {Promise<any|never>}
     */
    updateCountry() {
        return Country.setLastScan(this._country, this._city, this.name)
    }

    /**
     *
     * @returns {Promise<any[] | void>}
     */
    mergeAndUpdate(){
        return Hotel.getAll({city: this._city})
            .then(e =>
                City.updateById({
                    ...this._cityData._doc,
                    hotels: e.length
                }).then(() => e)
            )
            .then((e) => {
                let promises = [];
                let ids = [];

                e.forEach(a => {

                    if (!ids.includes(a._id)) {

                        let match = e.filter(f =>
                            String(f._id).localeCompare(String(a._id)) !== 0 &&
                            StringComparator.compareTwoStrings(normalize(f.name), normalize(a.name)) > 0.85
                        )[0];

                        if (match != null) {
                            ids.push(match._id);
                            promises.push(Hotel.mergeHotel(a, match).then(() => log('Merging ' + match.name)).catch())
                        }
                    }

                });

                return Promise.all(promises).then(() => log('Duplicates have been merged')).catch();
            }).then(() => Hotel.getAll({city: this._city, address: 'none', validated: true}).then((hotels) =>
                InformationsManager.updateAddress(hotels)
            )).catch(() => log('No hotels without address'))
            .then(() => this.updateCountry())
    }

    /**
     *
     * @param url
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     * @private
     */
    _request(url) {
        return this._getCookie().then((cookies) =>
            request(Engine._opt(url, cookies)).then((data) =>
                this._getRunningProcess().then(res => {
                    if (!res || res.status !== -1)
                        return this.getBasicInformation(data)
                            .then(e => this._max = e)
                            .then(() => this._index = -1)
                            .then(() => this._launchRequest());

                    return this._launchRequest(data)
                })
            ).catch(e => console.log(e))
        ).catch(e => console.log(e))
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
     * @param country
     * @param city
     * @param checkin
     * @param checkout
     * @param adults
     * @param children
     * @param rooms
     * @param callback
     * @returns {Promise<any[] | void>}
     */
    initCity(country, city, checkin, checkout, adults, children, rooms, callback) {
        return City.getByName(city).then((e) => {
            this._cityName = e.name;
            this._city = e._id;
            this._cityData = e
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

            try {

                this._generator = new Generator(this._url, this._searchData, this._query);

                this._generator.generateUrl(callback);
            } catch (e) {
                console.log(e)
            }

            return this._request(this._generator.baseUrl);
        }).then(() => this.mergeAndUpdate())
            .catch(() =>
                City.create({
                    name: city
                }, "engine.js:488").then(() => this.search(country, city, checkin, checkout, adults, children, rooms, callback))
            )
    }

    /**
     *
     * @param country
     * @param city {String}
     * @param checkin {Date}
     * @param checkout {Date}
     * @param adults {Number}
     * @param children {Number}
     * @param rooms {Number}
     * @param callback {CallableFunction}
     */
    search(
        country,
        city,
        checkin = null,
        checkout = null,
        adults = 1,
        children = 0,
        rooms = 1,
        callback = null
    ) {
        this._eraseData();
        this._check_in = checkin;
        this._check_out = checkout;
        this._adults = adults;
        this._children = children;

        return Country.getByName(country).then(e => {
            this._country = e;

            return Country.hasCity(country, city).then((e) =>
                e ? this.initCity(country, city, checkin, checkout, adults, children, rooms, callback) :
                    Country.addCity(country, city).then(() =>
                        this.search(country, city, checkin, checkout, adults, children, rooms, callback)
                    )
            )
        }).catch(() =>
            Country.create(country)
                    .then((ctr) =>
                        Country.addCity(ctr.name, city).then(() =>
                            this.search(country, city, checkin, checkout, adults, children, rooms, callback))
                    )
        )
    }

}

/**
 *
 * @type {Engine}
 */
module.exports = Engine;
