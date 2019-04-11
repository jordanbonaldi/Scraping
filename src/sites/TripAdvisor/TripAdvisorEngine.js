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
            'https://tripadvisor.fr/TypeAheadJson?',
            /**
             * Default URL
             */
            'https://tripadvisor.fr/',
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
     * @param offer
     * @private
     */
    _getEngine(offer) {
        let name = offer.attribs['data-vendorname'];
        let price = offer.attribs['data-pernight'];

        if ((name != null || price != null)
            && this._engines.filter(e => e.name === name)[0] == null)
            this._engines.push({
                name: name,
                price: price,
                rate: this._rate,
                review: this._rateReview
            })
    }

    /**
     *
     * @param i
     * @returns {Array}
     * @private
     */
    _getPrices(i) {
        let prices = this._columns[i]
            .children[1]
            .children[1]
            .children[0]
            .children[0]
            .children[0];

        let bestOffer = prices.children[1].children[0];
        let other = prices.children[2].children;

        this._engines = [];

        other.forEach(e => this._getEngine(e));
        this._getEngine(bestOffer);

        return this._engines.sort((a, b) => a.price - b.price)
    }

    /**
     *
     * @param i
     * @returns {string}
     * @private
     */
    _getRate(i) {
        let rate = this._columns[i]
            .children[1]
            .children[1]
            .children[1]
            .children[0]
            .children[0].attribs['alt'];

        if (rate == null)
            rate = this._columns[i]
                .children[1]
                .children[1]
                .children[1]
                .children[1]
                .children[0].attribs['alt'];

        if (rate == null)
            return rate;

        rate = rate.match(/\d/g).join('').substr(0, rate.length - 1);

        if (rate.length > 1)
            rate = (rate/10).toFixed(1);

        return rate;
    }

    /**
     *
     * @param i
     * @returns {number}
     * @private
     */
    _getRateReview(i) {
        let review = this._columns[i]
            .children[1]
            .children[1]
            .children[1]
            .children[0]
            .children[1];

        try {
            if (review == null)
                review = this._columns[i]
                    .children[1]
                    .children[1]
                    .children[1]
                    .children[1]
                    .children[1]
                    .children[0].data;
            else
                review = review.children[0].data;
        } catch(e) { return 0 }

        return review.match(/\d/g).join('')
    }

    /**
     *
     * @param i
     * @returns {*}
     * @private
     */
    _getName(i) {
        let name = this._columns[i].children[1].children[0].children[0].children[0].children[0].data;

        return name == null ? this._columns[i]
            .children[1]
            .children[0]
            .children[0]
            .children[1]
            .children[0]
            .children[0].data : name;
    }

    /**
     *
     * @param start
     * @private
     */
    _getHotels(start = 0) {
        let hotels = [];
        for (let i = start; i < this._columns.length; i++) {

            let name;

            if (((name = this._getName(i)) == null) || (this._rateReview = this._getRateReview(i)) == null) {
                this.incrRead();

                continue
            }

            this._rate = this._getRate(i);

            let engines = this._getPrices(i);

            if (engines.length === 0) {
                console.log("No price data for " + name);
                this.incrRead();

                continue
            } else console.log(name + " done!");


            hotels.push({
                name: name,
                address: 'none',
                city: super.city,
                engine: engines
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
        this._columns = $('.hasDates .listing .meta_listing.ui_columns', this._data);


        if (this._columns.length <= 1)
            return [];

        {
            while (this._columns[++i] === undefined || this._columns[i].attribs['data-locationid'] === undefined) ;
        }

        return this._getHotels(i);
    }

}

/**
 *
 * @type {TripAdvisorEngine}
 */
module.exports = new TripAdvisorEngine();
