const Engine = require('../handlers/Engine');
const $ = require('cheerio');

class BookingEngine extends Engine {

    constructor() {
        super(
            'hotels.com',
            /**
             * Booking URL
             */
            'https://fr.hotels.com/search.do?f-price-currency-code=EUR&',

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

            'pn'
        );
    }

    getBasicInformation(data) {
        let search = $('p.total-count', data)[0].children[0].data;
        let max = search.match(/\d/g);
        max = max.join('');

        return max
    }

    handleOffset(index) {
        return index + 1
    }

    /**
     * @param data
     *
     * @returns {Number}
     */
    parseSite(data) {
        let search = $('li.hotel', data);

        console.log('\n');

        for (let i = 0; i < search.length; i++) {
            let name = search[i].attribs['data-title'];
            let id = search[i].attribs['data-hotel-id'];

            let f = $('[data-hotel-id='+'"'+id+'"'+'] .pricing .price a', data)[0];

            if (f != null && f.hasOwnProperty('children')) {
                f = f.children[0];

                f = f.next === null ? f.children[0].data : f.next.children[0].data;

                console.log(name + ' -> ' + f);
            }

        }

        console.log('\n');

        return search.length;
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = new BookingEngine();
