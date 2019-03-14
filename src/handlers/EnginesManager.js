const HotelsComEngine = require('../sites/HotelsComEngine');

class EnginesManager {

    constructor(...engines) {
        this._engines = engines;
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
        this._engines.forEach(e => {
            e.search(
                city,
                checkin,
                checkout,
                adults,
                children,
                rooms,
                callback
            )
        })
    }

}

const engine = new EnginesManager(HotelsComEngine);

load = () => {
    engine.loadSearch('nice')
};

module.exports = load;
