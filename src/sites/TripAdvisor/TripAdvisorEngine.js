const Engine = require('../../handlers/Engine');
const $ = require('cheerio');
const City = require('../../crud/CityCrud');
const request = require('request-promise');
const TripAdvisorQueries = require('./TripAdvisorQueries');
const TripAdvisorSearchData = require('./TripAdvisorSearchData');
const TripAdvisorGenerator = require('./TripAdvisorGenerator');
const InformationManager = require('../../handlers/InformationsManager');

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

            null,

            /**
             * Queries -> none
             */
        );

        this.__query = new TripAdvisorQueries(
            'action',
            'query',
            'types',
            'max'
        );

        this._hotels = []
    }

    /**
     *
     * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
     * @private
     */
    _getHotelsUrl() {
        console.log(this._generator.baseUrl);
        return request(this._generator.baseUrl).then((data) => {
            data = JSON.parse(data);
            let url = null;
            try {
                url = data.results[0].urls[0].url;
            } catch (e) {
                console.log("Bad city for tripadvisor but exists on hotels.com");
            }

            return request(this.defaultUrl + url).then((data) => {
                return this.defaultUrl + $('.brand-quick-links-QuickLinkTileItem__link--1k5lE', data)[0].attribs.href;
            })
        })
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
     * @returns {Promise<any[] | void | T | never>}
     */
    initCity(country, city, checkin, checkout, adults, children, rooms, callback) {
        return City.getByName(city).then((e) => {
            this.city = e._id;
            super._cityName = e.name;

            return e.name
        }).then((name) => {
            let searchData = new TripAdvisorSearchData(
                'API',
                name
            );

            this._generator = new TripAdvisorGenerator(this.url, searchData, this.__query);

            this._generator.generateUrl(callback);

            return this._getHotelsUrl().then((url) => {
                this._generator.baseUrl = url;
                return super.newGeneratorRequester(this._generator, url)
            }).catch(e => console.log("Out"))
        }).then(() => super.mergeAndUpdate()).catch(() =>
            City.create({
                name: city
            }, "tripadvisorengine:91").then(() => this.search(country, city, checkin, checkout, adults, children, rooms, callback))
        )
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    getBasicInformation(data) {
        return new Promise((resolve) => resolve(super.getData('', '.hotels-sort-filter-header-sort-filter-header__highlight--14Kyo', data).match(/\d/g).join('')))
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

        if ((name != null && price != null)
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
        let prices;
        try {
            prices = this._columns[i]
                .children[1]
                .children[1]
                .children[0]
                .children[0]
                .children[0]
        } catch (e) { return [] }

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
     * @returns {string | number}
     * @private
     */
    _getRate(i) {
        let rate = 0;

        try {
            rate = this._columns[i]
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
        } catch(e) { return rate }

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
        let review;

        try {
            review = this._columns[i]
                .children[1]
                .children[1]
                .children[1]
                .children[0]
                .children[1];

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
            let engines;

            if ((name = this._getName(i)) == null ||
                (engines = this._getPrices(i)) == null
            ) {
                this.incrRead();

                continue
            }

            this._rateReview = this._getRateReview(i);
            this._rate = this._getRate(i);

            if (engines.length === 0) {
                this.incrRead();

                continue
            }


            hotels.push({
                name: name,
                address: 'none',
                city: super.city,
                country: super.country,
                engine: engines,
                rate: 0
            })
        }

        return City.getById(super.city).then(city => this._oneByOne(0, hotels, city).then(() => this._hotels)).catch((e) => e);
    }

    /**
     *
     * @param i
     * @param hotels
     * @param city
     * @returns {PromiseLike<any[] | never | never>}
     * @private
     */
    _oneByOne(i, hotels, city) {
        return i >= hotels.length ?
            new Promise((resolve) => resolve(true)) :
            InformationManager.searchHotelName('hotels.com', hotels[i].name + ' ' + city.name + ' France')
                .then((result) => {

                    hotels[i].validated = false;

                    if (result != null) {
                        hotels[i].name = result;
                        hotels[i].validated = true
                    }

                    this._hotels.push(hotels[i]);

                    return this._oneByOne(++i, hotels, city)
                });
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
