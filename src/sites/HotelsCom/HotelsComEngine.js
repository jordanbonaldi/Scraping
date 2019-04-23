const Engine = require('../../handlers/Engine');
const $ = require('cheerio');

class HotelsComEngine extends Engine {

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
        return super.getData('', 'p.total-count', data, true)
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
     * @param classes
     * @param digit
     * @returns {*}
     */
    _getData(classes, digit = 0) {
        return super.getData('[data-hotel-id='+'"'+this._id+'"'+']', classes, this._data, digit)
    }

    /**
     *
     * @returns {*}
     * @private
     */
    _getAddress() {
        return this._getData('.hotel-wrap .contact span', false)
    }

    /**
     *
     * @returns {number}
     * @private
     */
    _getPrice() {
        let f = $('[data-hotel-id='+'"'+this._id+'"'+'] .pricing .price a', this._data)[0];

        let price = 0;

        if (f != null && f.hasOwnProperty('children')) {
            f = f.children[0];

            price = f.next === null ? f.children[0].data.match(/\d/g).join('') : f.next.children[0].data.match(/\d/g).join('')
        }

        return price
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _getRate() {
        let rate = this._getData('.reviews-box .guest-reviews-badge', true);

        if (rate != null && rate.length > 1)
            rate = (rate/10).toFixed(1);

        return rate;
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _getReviews() {
        return this._getData('.trip-advisor .ta-total-reviews', true)
    }

    /**
     * @param data
     *
     * @returns {Array}
     */
    parseSite(data) {
        this._data = data;
        let search = $('li.hotel', data);

        let hotel = [];

        for (let i = 0; i < search.length; i++) {
            let name = search[i].attribs['data-title'];
            this._id = search[i].attribs['data-hotel-id'];

            let rate;

            if ((rate = this._getRate()) == null) {
                this.incrRead();

                continue
            }

            console.log(name + " done!");

            let price = this._getPrice();
            let address = this._getAddress();

            let reviews = this._getReviews();

            hotel.push({
                name: name,
                address: address,
                city: super.city,
                rate: 0,
                engine: {
                    name: 'Hotels.com',
                    id: this._id,
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
 * @type {HotelsComEngine}
 */
module.exports = new HotelsComEngine();
