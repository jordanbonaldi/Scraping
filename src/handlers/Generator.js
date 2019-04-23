class Generator {

    /**
     *
     * @param baseUrl {String}
     * @param searchData {SearchData}
     * @param query {Query}
     */
    constructor(baseUrl, searchData, query)
    {
        this._baseUrl = baseUrl;
        this._searchData = searchData;
        this._query = query;

        this._searchDataLink()
    }

    get baseUrl() {
        return this._baseUrl;
    }

    set baseUrl(value) {
        this._baseUrl = value;
    }


    /**
     * Link query and generator
     */
    _searchDataLink() {
        this._searchData.linkQuery(this._query);
    }


    /**
     *
     * @param callback
     * @returns {String}
     */
    generateUrl(callback = null) {
        Object.keys(this._query)
            .forEach(e => {
                if (this._query[e].data !== null && this._query[e].data.hasOwnProperty('query'))
                    this._baseUrl += this._query[e].data.query + "=" + this._query[e].data.value + "&"
            });

        if (callback !== null)
            this._baseUrl = callback(this._baseUrl);

        return this._baseUrl
    }

    /**
     *
     * @param value
     * @returns {string}
     */
    addOffSet(value) {
        return this._baseUrl + this._query.offset + "=" + value;
    }

}

/**
 *
 * @type {Generator}
 */
module.exports = Generator;
