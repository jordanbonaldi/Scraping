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
        return $('.descriptive_header_text span.highlight', data)[0].children[0].data.match(/\d/g).join('');
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
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        console.log("PARSING MODE")
    }

}

/**
 *
 * @type {TripAdvisorEngine}
 */
module.exports = new TripAdvisorEngine();
