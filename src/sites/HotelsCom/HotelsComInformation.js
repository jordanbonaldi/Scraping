const $ = require('cheerio');
const Information = require('../../handlers/Information');
const Generator = require('../../handlers/Generator');
const HotelsComQueries = require('./HotelsComQueries');
const HotelsComSearchData = require('./HotelsComSearchData');

class HotelsComInformation extends Information
{
    constructor() {
        super(
            'Hotels.com',
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
}
