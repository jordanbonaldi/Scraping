const Generator = require('./Generator');
const BookingEngine = require('./BookingEngine');

class EnginesManager {
    load() {

        let generator = new Generator('https://www.booking.com/searchresults.html?',
            { 'checkin_month' : 'checkin_month'     },
            { 'checkin_day'   : 'checkin_monthday'  },
            { 'checkin_year'  : 'checkin_year'      },

            { 'checkout_month': 'checkout_month'    },
            { 'checkout_day'  : 'checkout_monthday' },
            { 'checkout_year' : 'checkout_year'     },

            { 'adults'        : 'group_adults'      },
            { 'children'      : 'group_children'    },

            { 'rooms'         : 'no_rooms'          },

            { 'city'          : 'ss_raw'            },

            { 'search_type'   : 'dest_type'         },
        );

        new BookingEngine(generator);
    }
}

/**
 *
 * @type {EnginesManager}
 */
module.exports = EnginesManager;
