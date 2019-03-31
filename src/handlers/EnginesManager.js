const HotelsComEngine = require('../sites/HotelsComEngine');
const BookingEngine = require('../sites/BookingEngine');
const TripAdvisor = require('../sites/TripAdvisor/TripAdvisorEngine');

class EnginesManager {

    constructor(...engines) {
        this._engines = engines;
    }

    eta() {
        return this._engines[0].frequence;
    }

    /**
     *
     * @param city
     * @param checkin
     * @param checkout
     * @param adults
     * @param children
     * @param rooms
     * @param callback
     */
    loadSearch(
        city,
        checkin = null,
        checkout = null,
        adults = 1,
        children = 0,
        rooms = 1,
        callback = null
    ) {
        return Promise.all(this._engines.map(engine => {
            return engine.search(
                city,
                checkin,
                checkout,
                adults,
                children,
                rooms,
                callback
            ).then(() => {
                console.log("Finished for " + city);
            })
        }))
    }

}

const engine = new EnginesManager(TripAdvisor);

const load = () => {
    return engine.loadSearch('nice')
};

module.exports = {load, engine};
