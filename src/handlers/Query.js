/**
 * Allowing generic setter and getter instead of coding each one in Query
 */
class QuerySetter {

    /**
     *
     * @param data
     */
    constructor(data) {
        this._data = data;
    }

    /**
     *
     * @returns {*}
     */
    get data() {
        return this._data;
    }

    /**
     *
     * @param value
     */
    set data(value) {
        if (this._data.hasOwnProperty('value'))
            return;

        this._data = {
            value: value,
            query: this._data
        }
    }
}

class Query {

    /**
     *
     * @param checkin_month
     * @param checkin_day
     * @param checkin_year
     * @param checkout_month
     * @param checkout_day
     * @param checkout_year
     * @param adults
     * @param children
     * @param rooms
     * @param city
     * @param offset
     */
    constructor(
        checkin_month,
        checkin_day,
        checkin_year,
        checkout_month,
        checkout_day,
        checkout_year,
        adults,
        children,
        rooms,
        city,
        offset
    ) {
        this._checkin_month = new QuerySetter(checkin_month);
        this._checkin_day = new QuerySetter(checkin_day);
        this._checkin_year = new QuerySetter(checkin_year);
        this._checkout_month = new QuerySetter(checkout_month);
        this._checkout_day = new QuerySetter(checkout_day);
        this._checkout_year = new QuerySetter(checkout_year);
        this._adults = new QuerySetter(adults);
        this._children = new QuerySetter(children);
        this._rooms = new QuerySetter(rooms);
        this._city = new QuerySetter(city);
        this._offset = new QuerySetter(offset);
    }


    get offset() {
        return this._offset.data;
    }

    set offset(value) {
        this._offset.data = value;
    }

    get checkin_month() {
        return this._checkin_month.data;
    }

    get checkin_day() {
        return this._checkin_day.data;
    }

    get checkin_year() {
        return this._checkin_year.data;
    }

    get checkout_month() {
        return this._checkout_month.data;
    }

    get checkout_day() {
        return this._checkout_day.data;
    }

    get checkout_year() {
        return this._checkout_year.data;
    }

    get adults() {
        return this._adults.data;
    }

    get children() {
        return this._children.data;
    }

    get rooms() {
        return this._rooms.data;
    }

    get city() {
        return this._city.data;
    }

    set checkin_month(value) {
        this._checkin_month.data = value;
    }

    set checkin_day(value) {
        this._checkin_day.data = value;
    }

    set checkin_year(value) {
        this._checkin_year.data = value;
    }

    set checkout_month(value) {
        this._checkout_month.data = value;
    }

    set checkout_day(value) {
        this._checkout_day.data = value;
    }

    set checkout_year(value) {
        this._checkout_year.data = value;
    }

    set adults(value) {
        this._adults.data = value;
    }

    set children(value) {
        this._children.data = value;
    }

    set rooms(value) {
        this._rooms.data = value;
    }

    set city(value) {
        this._city.data = value;
    }

}

module.exports = {Query, QuerySetter};
