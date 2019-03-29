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

    /**
     *
     * @param data
     * @returns {number}
     */
    getBasicInformation(data) {
        let search = $('.sr_item', data);
        let length = search.length;

        let pagination = $('li.bui-pagination__item', data);
        let pagination_length = pagination.length;

        let max = pagination[pagination_length - 2].children[1].children[0].data;

        return max * length;
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
     * @param classes
     * @param digit
     * @returns {*}
     * @private
     */
    _getData(classes, digit = 0) {
        return super.getData('[data-hotelid='+'"'+this._id+'"'+']', classes, this._data, digit)
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _getName() {
        return this._getData('.sr-hotel__name').replace(/\s+/g, ' ').trim();
    }

    /**
     *
     * @returns {*}
     * @private
     */
    _getRate() {
        return this._getData('.bui-review-score__badge', true)
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _getReviews() {
        return this._getData('.bui-review-score__text', true)
    }

    /**
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        this._data = data;
        let search = $('.sr_item', data);

        let hotel = [];

        for (let i = 0; i < search.length; i++) {
            this._id = search[i].attribs['data-hotelid'];

            if (this._getRate() == null)
                continue;

            let name = this._getName();

            console.log(name + " done!");

            hotel.push({
                name: name,
                address: 'none',
                city: super.city,
                engine: {
                    name: 'Booking.com',
                    price: '',
                    rate: this._getRate()/10,
                    reviews: this._getReviews()
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
