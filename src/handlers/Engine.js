const Query = require('./Query');
const SearchData = require('./SearchData');
const Generator = require('./Generator');

const request = require('request-promise');

class Engine {
    /**
     *
     * @param url
     * @param queries
     */
    constructor(url, ...queries) {
        this._url = url;
        this._query = new Query(...queries);
    }

    /**
     *
     * @param data
     */
    parseSite(data = null) {
        return false
    };

    /**
     *
     * @param data
     */
    getBasicInformation(data = null) {
        return {offset: 0, max: 0}
    }

    /**
     *
     * @param url
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     * @private
     */
    _request(url) {
        return request("https://www.booking.com/searchresults.html?checkin_month=3&checkin_monthday=13&checkin_year=2019&checkout_month=3&checkout_monthday=14&checkout_year=2019&group_adults=1&group_children=0&no_rooms=1&ss=nice&").then((data) => {
            let urls = [];
            let {offset, max} = this.getBasicInformation(data);

            for (let i = 0; i < max; i ++)
                urls.push(this._generator.addOffSet(i * offset));

            let promises = urls.map(url => request(url));

            Promise.all(promises).then(data => {
                data.forEach(e => {
                    this.parseSite(e)
                })
            })
        })
    }

    /**
     *
     * @param city {String}
     * @param checkin {Date}
     * @param checkout {Date}
     * @param adults {Number}
     * @param children {Number}
     * @param rooms {Number}
     * @param callback {CallableFunction}
     */
    search(
        city,
        checkin = null,
        checkout = null,
        adults = 1,
        children = 0,
        rooms = 1,
        callback = null
    ) {
        if (checkin === null)
            checkin = new Date();

        if (checkout === null) {
            checkout = new Date();
            checkout.setDate(checkin.getDate() + 1)
        }

        this._searchData = new SearchData(
            checkin,
            checkout,
            adults,
            children,
            rooms,
            city
        );

        this._generator = new Generator(this._url, this._searchData, this._query);

        this._generator.generateUrl(callback);

        return this._request(this._generator.baseUrl);
    }

}

/**
 *
 * @type {Engine}
 */
module.exports = Engine;
