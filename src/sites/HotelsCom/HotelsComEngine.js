const Engine = require('../../handlers/Engine');
const $ = require('cheerio');

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
     * @param data
     * @returns {string}
     */
    getBasicInformation(data) {
        return data.data.body.searchResults.totalCount;
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
     * @param data
     *
     * @returns {Array}
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

        return hotel;
    }

}

/**
 *
 * @type {HotelsComEngine}
 */
module.exports = new HotelsComEngine();
