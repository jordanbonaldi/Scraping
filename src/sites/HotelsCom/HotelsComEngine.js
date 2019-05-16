const Engine = require('../../handlers/Engine');
const $ = require('cheerio');
const request = require('request-promise');
const fs = require('fs');

class HotelsComEngine extends Engine {

    constructor() {
        super(
            'hotels.com',
            /**
             * Booking URL
             */
            //'https://fr.hotels.com/search.do?f-price-currency-code=EUR&',
            'https://fr.hotels.com/search/listings.json?sort-order=BEST_SELLER&',

            'https://fr.hotels.com/',

            /**
             * Any cookie ?
             */

            './cookie',

            /**
             * QUERIES
             */

            'q-check-in',
            null,
            null,

            'q-check-out',
            null,
            null,

            'q-room-0-adults',
            'q-room-0-children',

            'q-rooms',

            'q-destination',

            'pn'
        );
    }

    /**
     *
     * @param url
     * @returns {Promise|*|PromiseLike<number | never>|Promise<number | never>}
     * @private
     */
    _loop(url) {
        let cookie = fs.readFileSync('./cookie', 'utf8').replace(/(\r\n|\n|\r)/gm, "");
        return request({
            uri: url,
            headers: {
                'cookie': `${cookie}`,
                'cache-control': 'no-cache',
                'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
                'Accept': '*/*',
                'Connection': 'close',
            },
            json: true,
        }).then(e => {
            let ix = this.setOffset(e);

            return ix == null ? e.data.body.searchResults.totalCount - e.data.body.searchResults.unavailableCount : this._loop(this.url + ix);
        })
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    getBasicInformation(data) {
        console.log("Calculating max hotels to load !");
        return this._loop(this.url + this.setOffset(data))
    }

    /**
     *
     * @param index
     * @param read
     * @returns {*}
     */
    handleOffset(index, read = 0) {
        return index + 1
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    setOffset(data) {
        try {
            return data.data.body.searchResults.pagination.nextPageUrl
        } catch (e) {
            return null
        }
    }

    /**
     * @param data
     *
     * @returns {Promise<any>}
     */
    parseSite(data) {
        let hotel = [];
        this._data = data.data.body.searchResults.results;

        for (let i = 0; i < this._data.length; i++) {
            let e = this._data[i];

            if (e.ratePlan == null) {
                console.log('No price data for ' + e.name);
                super.incrRead();

                continue
            }

            console.log(e.name + ' done !');

            hotel.push({
                name: e.name,
                address: [e.address.streetAddress, e.address.locality, e.address.postalCode, e.address.region, e.address.countryName].join(' '),
                city: super.city,
                rate: e.starRating,
                engine: {
                    name: 'Hotels.com',
                    id: e.id,
                    price: e.ratePlan.price.current,
                    rate: e.guestReviews == null ? 0 : e.guestReviews.rating,
                    reviews: e.guestReviews == null ? 0 : e.guestReviews.total
                }
            })
        }

        console.log('Load ' + hotel.length + ' on ' + this._data.length);

        return new Promise((resolve, reject) => resolve(this._data.length === 0 ? null : hotel));
    }

}

/**
 *
 * @type {HotelsComEngine}
 */
module.exports = new HotelsComEngine();
