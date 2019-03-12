const queryString = require('query-string');

class Generator {

    /**
     * Default dictionary
     *
     * checkin_month
     * checkin_day
     * checkin_year
     *
     * checkout_month
     * checkout_day
     * checkout_year
     *
     * adults
     * children
     *
     * rooms
     *
     * city
     *
     * search_type
     *
     * @param base_url
     * @param queries
     */
    constructor(base_url, ...queries)
    {
        this.query = {};

        this.queries = queries;

        {

            this.query.checkin_month = this.getQueryParsed('checkin_month');
            this.query.checkin_day = this.getQueryParsed('checkin_day');
            this.query.checkin_year = this.getQueryParsed('checkin_year');

            this.query.checkout_month = this.getQueryParsed('checkout_month');
            this.query.checkout_day = this.getQueryParsed('checkout_day');
            this.query.checkout_year = this.getQueryParsed('checkout_year');

            this.query.adults = this.getQueryParsed('adults');
            this.query.children = this.getQueryParsed('children');

            this.query.rooms = this.getQueryParsed('rooms');

            this.query.city = this.getQueryParsed('city');

            this.query.search_type = this.getQueryParsed('search_type');

        }

        this.baseUrl = base_url;
    }

    getQueryParsed(query) {
        return this.queries.filter(e => {
            console.log(e[Object.keys(query)[0]]);
            console.log(e + " " + query + " => " + Object.keys(query));
            return e[Object.keys(query)[0]] !== undefined
        }).map(e => e[Object.values(e)])[0];
    }

    /**
     *
     * @param callback
     * @returns {String}
     */
    generateUrl(callback = null) {
        console.log(this.query);
        console.log(queryString.stringify(this.query));
        this.baseUrl += queryString.stringify(this.query);
        if (callback)
            this.baseUrl = callback(this.baseUrl)

        return this.baseUrl;
    }

}

/**
 *
 * @type {Generator}
 */
module.exports = Generator;
