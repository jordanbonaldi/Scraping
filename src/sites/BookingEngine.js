const Engine = require('../handlers/Engine');
const $ = require('cheerio');

class BookingEngine extends Engine {

    constructor() {
        super(
            'booking.com',
            /**
             * Booking URL
             */
            'https://www.booking.com/searchresults.html?&selected_currency=EUR&room1=A%2CA&sb_price_type=total&',

            'https://booking.com',

            /**
             * QUERIES
             */

            'checkin_month',
            'checkin_monthday',
            'checkin_year',

            'checkout_month',
            'checkout_monthday',
            'checkout_year',

            'group_adults',
            'group_children',

            'no_rooms',

            'ss',

            'offset'
        );
    }

    getBasicInformation(data) {
        let search = $('.sr_item', data);
        let length = search.length;

        let pagination = $('li.bui-pagination__item', data);
        let pagination_length = pagination.length;

        let max = pagination[pagination_length - 2].children[1].children[0].data;

        return max * length;
    }

    handleOffset(index, read) {
        return read;
    }

    /**
     * @param data
     *
     * @returns {Promise<any>}
     */
    parseSite(data) {
        let search = $('.sr_item', data);

        for (let i = 0; i < search.length; i++) {
            let id = search[i].attribs['data-hotelid'];

            let f = $('[data-hotelid='+'"'+id+'"'+'] .sr-hotel__name', data)[0].children[0].data;

            console.log(f)
        }

        return search.length;
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = new BookingEngine();
