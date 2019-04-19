const {QuerySetter} = require('../../handlers/Query');

class HotelsComQueries
{

    /**
     *
     * @param locale {String}
     * @param boostConfig {String}
     * @param excludeLpa {String}
     * @param providerInfoTypes {String}
     * @param callback {String}
     * @param query {String}
     */
    constructor(locale, boostConfig, excludeLpa, providerInfoTypes, callback, query) {
        this._locale = new QuerySetter(locale);
        this._boostConfig = new QuerySetter(boostConfig);
        this._excludeLpa = new QuerySetter(excludeLpa);
        this._providerInfoTypes = new QuerySetter(providerInfoTypes);
        this._callback = new QuerySetter(callback);
        this._query = new QuerySetter(query);
    }


    get locale() {
        return this._locale.data;
    }

    set locale(value) {
        this._locale.data = value;
    }

    get boostConfig() {
        return this._boostConfig.data;
    }

    set boostConfig(value) {
        this._boostConfig.data = value;
    }

    get excludeLpa() {
        return this._excludeLpa.data;
    }

    set excludeLpa(value) {
        this._excludeLpa.data = value;
    }

    get providerInfoTypes() {
        return this._providerInfoTypes.data;
    }

    set providerInfoTypes(value) {
        this._providerInfoTypes.data = value;
    }

    get callback() {
        return this._callback.data;
    }

    set callback(value) {
        this._callback.data = value;
    }

    get query() {
        return this._query.data;
    }

    set query(value) {
        this._query.data = value;
    }
}

module.exports = HotelsComQueries;
