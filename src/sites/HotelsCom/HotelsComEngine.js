const Engine = require('../../handlers/Engine');
const $ = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const {log} = require('../../utils/utils');
const ProcessCrud = require('../../crud/ProcessCrud');

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

        this._tempCount = 0;
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

            console.log(url)

            if (e.data.body.searchResults.totalCount != null)
                return e.data.body.searchResults.totalCount -
                    (e.data.body.searchResults.unavailableCount ? e.data.body.searchResults.unavailableCount : 0);

            console.log(e.data.body);

            this._tempCount += ix == null ? 0 : e.data.body.searchResults.results.length;

            log('Hotels count : ' + this._tempCount);

            return ProcessCrud.create({
                name: 'hotels.com',
                max: 0,
                current: 0,
                chunk: 0,
                perChunk: 0,
                index: 0,
                freq: 0,
                offsets: 0,
                status: -1,
                data: `Counting hotels: ${this._tempCount}`,
                city: this.city,
                cityName: this.cityName,
                setOffset: 0,
                eta: 0
            }).then(() =>
                ix == null ? e.data.body.searchResults.totalCount - e.data.body.searchResults.unavailableCount : this._loop(this.url + ix)
            )
        })
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    getBasicInformation(data) {
        log("Calculating max hotels to load !");
        return this._loop(this.url + this.setOffset(data)).then(e => {
            log(`Found ${e} hotels, starting...`);

            return e
        })
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
    setOffset(data = null)  {
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
                super.incrRead();

                continue
            }

            hotel.push({
                name: e.name,
                address: [e.address.streetAddress, e.address.locality, e.address.postalCode, e.address.region, e.address.countryName].join(' '),
                city: super.city,
                rate: e.starRating,
                validated: true,
                engine: {
                    name: 'Hotels.com',
                    id: e.id,
                    price: e.ratePlan.price.current,
                    rate: e.guestReviews == null ? 0 : e.guestReviews.rating,
                    reviews: e.guestReviews == null ? 0 : e.guestReviews.total
                }
            })
        }

        return new Promise((resolve) => resolve(this._data.length === 0 ? null : hotel));
    }

}

/**
 *
 * @type {HotelsComEngine}
 */
module.exports = new HotelsComEngine();
