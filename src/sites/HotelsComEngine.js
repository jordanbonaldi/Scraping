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

    /**
     *
     * @param data
     * @returns {string}
     */
    getBasicInformation(data) {
        let search = $('p.total-count', data)[0].children[0].data;
        let max = search.match(/\d/g);
        max = max.join('');

        return max
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
     * @param id
     * @param data
     * @param classes
     * @param digit
     * @returns {*}
     */
    _getData(id, data, classes, digit = 0) {
        return super.getData('[data-hotel-id='+'"'+id+'"'+']', classes, data, digit)
    }

    /**
     *
     * @param id
     * @param data
     * @returns {*}
     * @private
     */
    _getAddress(id, data) {
        return this._getData(id, data, '.hotel-wrap .contact span', false)
    }

    /**
     *
     * @param id
     * @param data
     * @returns {number}
     * @private
     */
    _getPrice(id, data) {
        let f = $('[data-hotel-id='+'"'+id+'"'+'] .pricing .price a', data)[0];

        let price = 0;

        if (f != null && f.hasOwnProperty('children')) {
            f = f.children[0];

            price = f.next === null ? f.children[0].data.match(/\d/g).join('') : f.next.children[0].data.match(/\d/g).join('')
        }

        return price
    }

    /**
     *
     * @param id
     * @param data
     * @returns {string}
     * @private
     */
    _getRate(id, data) {
        return this._getData(id, data, '.reviews-box .guest-reviews-badge', true)
    }

    /**
     *
     * @param id
     * @param data
     * @returns {string}
     * @private
     */
    _getReviews(id, data) {
        return this._getData(id, data, '.trip-advisor .ta-total-reviews', true)
    }

    /**
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        let search = $('li.hotel', data);

        let hotel = [];

        for (let i = 0; i < search.length; i++) {
            let name = search[i].attribs['data-title'];
            let id = search[i].attribs['data-hotel-id'];

            if (this._getRate(id, data) == null)
                continue;

            console.log(name + " done!");

            let price = this._getPrice(id, data);
            let address = this._getAddress(id, data);

            let rate = this._getRate(id, data);
            let reviews = this._getReviews(id, data);

            hotel.push({
                name: name,
                address: address,
                city: super.city,
                engine: {
                    name: 'Hotels.com',
                    price: price,
                    rate: rate/10,
                    reviews: reviews
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
