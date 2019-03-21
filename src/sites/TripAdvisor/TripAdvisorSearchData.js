const TripAdvisorAPIQuery = require('./TripAdvisorQueries');

class TripAdvisorSearchData
{
    /**
     *
     * @param action {String}
     * @param query {String}
     * @param types {String}
     * @param max {Number}
     */
    constructor(action, query, types = 'geo', max = 1) {
        this._action = action;
        this._query = query;
        this._types = types;
        this._max = max;
    }

    /**
     *
     * @param query {TripAdvisorAPIQuery}
     */
    linkQuery(query) {
        query.action = this._action;
        query.query = this._query;
        query.types = this._types;
        query.max = this._max;
    }
}

module.exports = TripAdvisorSearchData;
