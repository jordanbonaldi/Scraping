const $ = require('cheerio');
const request = require('request-promise');
const Hotel = require('../../crud/HotelCrud');
const Information = require('../../handlers/Information');
const HotelsComSearchData = require('./HotelsComSearchData');
const HotelsComQueries = require('./HotelsComQueries');

class HotelsComInformation extends Information
{
    constructor() {
        super(
            /**
             * Name
             */
            'hotels.com',

            /**
             * Url
             */
            'https://lookup.hotels.com/suggest/champion/json?',

            /**
             * Search Data Class
             */
            HotelsComSearchData,

            /**
             * Query Class
             */
            HotelsComQueries,
            /**
             * Query Names
             */

            'locale',
            'boostConfig',
            'excludeLpa',
            'providerInfoTypes',
            'callback',
            'query'
        )
    }

    _getStringified(id) {
        return 'https://fr.hotels.com/ho' + id + '/'
    }

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    getUrlFromId(id) {
        return new Promise(() => this._getStringified(id));
    }

    /**
     *
     * @param name
     * @returns {PromiseLike<any[] | never>}
     */
    getUrl(name) {
        let url = this.generator.generateUrl((url) =>
            url.split(' ').join('%20').split("'").join('%20').split('`').join('%20')
        );

        return request(url).then((res) => JSON.parse(res.substring(4, res.length - 2)))
            .then((res) => {
                let hotels;
                let selected = null;

                hotels = res.suggestions.filter(suggestion => suggestion.group == "HOTEL_GROUP")[0].entities;

                for (let i = 0; i < hotels.length; i++) {
                    if (hotels[i].name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(name.toLowerCase())) {
                        selected = hotels[i];
                        break;
                    }
                }

                if (selected != null)
                    hotels = [ selected ];

                return Promise.all(
                    hotels.map(ho =>
                        Hotel.getByName((selected != null ? name : ho.name))
                            .catch(() => console.log("Unexisting hotel " + ho.name))
                            .then((hotel) => {
                                return { doc: hotel, id: ho.destinationId }
                            })
                    ))
                    .then(values => values.filter(e => e.doc != null))
                    .then(values => values.filter(e =>
                        String(e.doc._id).localeCompare(String(this.currentHotelIndex._id)) === 0)[0])
                    .then(value => value != null ? this._getStringified(value.id) : null)
            })
    }

    /**
     *
     * @param data
     * @returns {{address: *, rate: string}}
     */
    getInformations(data) {
        let rate;
        let addr;

        try {
            rate = $('#property-header .star-rating-text', data)[0].children[0].data.match(/\d/g).join('')
        } catch (e) {
            rate = null
        }

        try {
            addr = $('#property-header .property-address .postal-addr', data)[0].children[0].data
        } catch (e) {
            addr = null
        }

        return {
            address: addr,
            rate: rate
        }
    }
}

/**
 *
 * @type {HotelsComInformation}
 */
module.exports = new HotelsComInformation();
