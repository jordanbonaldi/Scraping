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

    _getData(id, data, classes) {
        return $('[data-hotelid='+'"'+id+'"'+'] ' + classes, data)[0].children[0].data;
    }

    _getName(id, data) {
        return this._getData(id, data, '.sr-hotel__name').replace(/\s+/g, ' ').trim();
    }

    _getRate(id, data) {
        return this._getData(id, data, '.bui-review-score__badge').match(/\d/g).join('');
    }

    _getReviews(id, data) {
        return this._getData(id, data, '.bui-review-score__text').match(/\d/g).join('');
    }

    /**
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        let search = $('.sr_item', data);

        let hotel = [];

        for (let i = 0; i < search.length; i++) {
            let id = search[i].attribs['data-hotelid'];

            hotel.push({
                name: this._getName(id, data),
                address: 'none',
                city: super.city,
                engine: {
                    name: 'Booking.com',
                    price: '',
                    rate: this._getRate(id, data)/10,
                    reviews: this._getReviews(id, data)
                }
            });

        }

        return hotel;
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = new BookingEngine();
