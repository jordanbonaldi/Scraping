const Engine = require('../handlers/Engine');
const $ = require('cheerio');

class BookingEngine extends Engine {

    constructor() {
        super(
            /**
             * Booking URL
             */
            'https://fr.hotels.com/search/listings.json?f-price-currency-code=EUR&',

            'https://fr.hotels.com/',

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

            'start-index'
        );
    }

    getBasicInformation(data) {
        let length = data.data.body.searchResults.results.length;
        let max = data.data.body.searchResults.totalCount;

        return {
            offset: length,
            max: max
        }
    }

    /**
     * @param data
     *
     * @returns {Promise<any>}
     */
    parseSite(data) {
        console.log(data)
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = new BookingEngine();
