const Query = require('./Query');

class SearchData {

    /**
     *
     * @param checkin_date {Date}
     * @param checkout_date {Date}
     * @param adults {Number}
     * @param children {Number}
     * @param rooms {Number}
     * @param city {String}
     */
    constructor(checkin_date, checkout_date, adults, children, rooms, city) {
        this.checkin_date = checkin_date;
        this.checkout_date = checkout_date;
        this.adults = adults;
        this.children = children;
        this.rooms = rooms;
        this.city = city
    }

    /**
     *
     * @param query {Query}
     */
    linkQuery(query) {
        {
            if (query.checkin_day === null) {
                let month = this.checkin_date.getMonth()+1;
                month = month < 10 ? '0' + month : month;
                query.checkin_month = this.checkin_date.getFullYear()+'-'+ month + '-' + this.checkin_date.getDate();
            } else {
                query.checkin_month = this.checkin_date.getMonth() + 1;
                query.checkin_day = this.checkin_date.getDate();
                query.checkin_year = this.checkin_date.getFullYear();
            }

            if (query.checkout_day === null) {
                let month = this.checkin_date.getMonth()+1;
                month = month < 10 ? '0' + month : month;
                query.checkout_month = this.checkout_date.getFullYear()+'-'+ month + '-' + this.checkout_date.getDate();
            } else {
                query.checkout_month = this.checkout_date.getMonth() + 1;
                query.checkout_day = this.checkout_date.getDate();
                query.checkout_year = this.checkout_date.getFullYear()
            }
        }{
            query.adults = this.adults;
            query.children = this.children
        }{
            query.rooms = this.rooms
        }{
            query.city = this.city
        }
    }

    search(search) {
        return false
    }

}

module.exports = SearchData;
