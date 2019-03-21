const {QuerySetter} = require('../../handlers/Query');

class TripAdvisorAPIQuery
{
    /**
     *
     * @param action {String}
     * @param query {String}
     * @param types {String}
     * @param max {String}
     */
    constructor(action, query, types, max) {
        this._action = new QuerySetter(action);
        this._query = new QuerySetter(query);
        this._types = new QuerySetter(types);
        this._max = new QuerySetter(max);
    }


    get action() {
        return this._action.data;
    }

    get query() {
        return this._query.data;
    }

    get types() {
        return this._types.data;
    }

    get max() {
        return this._max.data;
    }


    set action(value) {
        this._action.data = value;
    }

    set query(value) {
        this._query.data = value;
    }

    set types(value) {
        this._types.data = value;
    }

    set max(value) {
        this._max.data = value;
    }
}

module.exports = TripAdvisorAPIQuery;
