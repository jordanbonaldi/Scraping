const Engine = require('../../handlers/Engine');
const $ = require('cheerio');
const City = require('../../crud/CityCrud');
const request = require('request-promise');
const TripAdvisorQueries = require('./TripAdvisorQueries');
const TripAdvisorSearchData = require('./TripAdvisorSearchData');
const TripAdvisorGenerator = require('./TripAdvisorGenerator');

class TripAdvisorEngine extends Engine{

    constructor() {
        super(
            'TripAdvisor',
            /**
             * Parse URL
             */
            'https://www.tripadvisor.fr/TypeAheadJson?',
            /**
             * Default URL
             */
            'https://www.tripadvisor.fr/',
            /**
             * Queries -> none
             */
        );

        this._query = new TripAdvisorQueries(
            'action',
            'query',
            'types',
            'max'
        )
    }

    /**
     *
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     * @private
     */
    _getHotelsUrl() {
        return request(this._generator.baseUrl).then((data) => {
            data = JSON.parse(data);
            let url = data.results[0].urls[0].url;

            return request(this.defaultUrl + url).then((data) => {
                return this.defaultUrl + $('.brand-quick-links-QuickLinkTileItem__link--1k5lE', data)[0].attribs.href;
            })
        })
    }

    /**
     *
     * @param city
     * @param checkin
     * @param checkout
     * @param adults
     * @param children
     * @param rooms
     * @param callback
     * @returns {PromiseLike<T | never>}
     */
    search(city,
           checkin = null,
           checkout = null,
           adults = 1,
           children = 0,
           rooms = 1,
           callback = null
    ) {
        return City.getByName(city).then((e) => {
            this.city = e._id;

            return e.name
        }).then((name) => {
            let searchData = new TripAdvisorSearchData(
               'API',
                name
            );

            this._generator = new TripAdvisorGenerator(this.url, searchData, this._query);

            this._generator.generateUrl(callback);

            return this._getHotelsUrl().then((url) => {
                this._generator.baseUrl = url;
                return super.newGeneratorRequester(this._generator, url)
            })
        })
    }

    /**
     *
     * @param data
     * @returns {Number}
     */
    getBasicInformation(data) {
        return super.getData('', '.descriptive_header_text span.highlight', data).match(/\d/g).join('')
    }

    /**
     *
     * @param index
     * @param read
     * @returns {*}
     */
    handleOffset(index, read) {
        return read;
    }

    /**
     *
     * @param classes
     */
    _getData(classes) {
        super.getData('[data-locationid='+'"'+this._id+'"'+']', classes, this._data)
    }

    /**
     *
     * @param data
     * @param id
     * @param review
     * @param rate
     * @returns {Array}
     * @private
     */
    _getPrices(review = 0, rate = 0) {
        let prices = $('[data-locationid='+'"'+this._id+'"'+'] .no_cpu', this._data);
        let length = prices.length;

        let engines = [];

        /**
         * Recuperation tarifaire des X -> length derniers prix
         */
        for (let i = 0; i < length; i++) {
            let attribs = prices[i].attribs;

            let name = attribs['data-vendorname'];
            let price = attribs['data-pernight'];

            if ((name != null || price != null)
                    && engines.filter(e => e.name === name)[0] == null)
                engines.push({
                    name: name,
                    price: price,
                    rate: rate,
                    review: review
                })
        }

        return engines.sort((a, b) => a.price - b.price)
    }

    /**
     *
     * @param data
     * @param id
     * @returns {string}
     * @private
     */
    _getRate() {
        let rate = $('[data-locationid='+'"'+this._id+'"'+'] .prw_rup .ui_bubble_rating', this._data)[0].attribs['alt'].match(/\d/g).join('');

        rate = rate.substr(0, rate.length - 1);

        if (rate.length > 1)
            rate = (rate/10).toFixed(1);

        return rate;
    }

    /**
     *
     * @param data
     * @param id
     * @returns {string}
     * @private
     */
    _getRateReview() {
        return this._getData('.review_count').match(/\d/g).join('')
    }

    _getName() {
        return this._getData('.listing_title a')
    }

    /**
     *
     * @param data
     * @param columns
     * @param start
     * @private
     */
    _getHotels(columns, start = 0) {
        let hotels = [];

        for (let i = start; i < columns.length; i++) {
            this._id = $('.listing .meta_listing .ui_columns', this._data)[i].attribs['data-locationid'];

            let name = this._getName();

            console.log(name + " done!");

            hotels.push({
                name: name,
                address: 'none',
                city: super.city,
                engine: this._getPrices(
                    this._getRateReview(),
                    this._getRate()
                )
            })
        }

        return hotels;
    }

    /**
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        this._data = data;

        let i = -1;
        let columns = $('.listing .meta_listing .ui_columns', this._data);

        {
            while (columns[++i].attribs['data-locationid'] === undefined) ;
        }

        return this._getHotels(columns, i);
    }

}

/**
 *
 * @type {TripAdvisorEngine}
 */
module.exports = new TripAdvisorEngine();
