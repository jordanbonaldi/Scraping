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
        let search = $('li.hotel', data);
        let length = search.length;

        return {
            offset: length,
            max: 15
        }
    }

    /**
     * @param data
     *
     * @returns {Promise<any>}
     */
    parseSite(data) {
        let search = $('li.hotel', data);

        for (let i = 0; i < search.length; i++) {
            let name = search[i].attribs['data-title'];
            let id = search[i].attribs['data-hotel-id'];

            let f = $('[data-hotel-id='+'"'+id+'"'+'] .pricing .price a', data)[0].children[0];

            f = f.next === null ? f.children[0].data : f.next.children[0].data;

            console.log(name + ' -> ' + f);

        }
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = new BookingEngine();
