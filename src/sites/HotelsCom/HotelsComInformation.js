const $ = require('cheerio');
const request = require('request-promise');
const Hotel = require('../../crud/HotelCrud');
const Information = require('../../handlers/Information');
const HotelsComSearchData = require('./HotelsComSearchData');
const HotelsComQueries = require('./HotelsComQueries');
const {normalize, log} = require('../../utils/utils');

const Similarity = require('string-similarity');

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

            'HOTEL_GROUP',

            'CITY_GROUP',

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
     * @param hotels
     * @param selected
     * @param name
     * @returns {Promise<any[] | never>}
     * @private
     */
    setAllpromise(hotels, selected, name) {
        return Promise.all(
            hotels.map(ho =>
                Hotel.getByName((selected != null ? name : ho.name))
                    .catch(() => log('Hotel ' + ho.name + ' not found in our DataBase'))
                    .then((hotel) => {
                        return {doc: hotel, id: ho.destinationId}
                    })
            ))
            .then(values =>
                values.filter(e => e.doc != null)
            )
            .then( values => super.getUnique(values, '_id'))
            .then(values => values.filter(e =>
                String(e.doc._id).localeCompare(String(this.currentHotelIndex._id)) === 0 ||
                Similarity.compareTwoStrings(normalize(e.doc.name), normalize(this.currentHotelIndex.name)) > 0.85
            )[0])
            .then(value => value != null ? this._getStringified(value.id) : null)
    }

    /**
     *
     * @param name
     * @param type
     * @returns {PromiseLike<any[] | never>}
     */
    getUrl(name, type) {
        let url = this.generator.generateUrl((url) =>
            url.split(' ').join('%20').split("'").join('%20').split('`').join('%20')
        );

        return request(url).then((res) => JSON.parse(res.substring(4, res.length - 2)))
            .then((res) => {
                let types;
                let selected = null;

                types = res.suggestions.filter(suggestion => suggestion.group == type)[0].entities;

                for (let i = 0; i < types.length; i++) {
                    if (types[i].name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(name.toLowerCase())) {
                        selected = types[i];
                        break;
                    }
                }

                if (selected != null)
                    types = [ selected ];

                return {
                    array: types,
                    selected: selected,
                    name: name
                }
            }).catch(() => {
                return {
                    array: [],
                    selected: 'no positif',
                    name: name
                }
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
