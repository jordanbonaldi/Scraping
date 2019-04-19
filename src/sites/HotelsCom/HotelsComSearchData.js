const HotelsComQuery = require('./HotelsComQueries');

class HotelsComSearchData
{
    /**
     *
     * @param locale
     * @param config
     * @param lpa
     * @param callback
     * @param search
     */
    constructor(locale = 'fr_FR', config = 'config-boost-champion', lpa = 'false', callback = 'srs', search = null) {
        this._locale = locale;
        this._config = config;
        this._lpa = lpa;
        this._callback = callback;
        this._search = search
    }

    /**
     *
     * @param query {HotelsComQueries}
     */
    linkQuery(query) {
        query.locale = this._locale;
        query.boostConfig = this._config;
        query.excludeLpa = this._lpa;
        query.callback = this._callback;
        query.query = this._search
    }

    search(search) {
        this._search = search
    }
}

module.exports = HotelsComSearchData;
