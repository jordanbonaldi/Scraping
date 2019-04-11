const CityCrud = require('../crud/CityCrud');

class EnginesManager {

    /**
     *
     * @param engines {Array}
     */
    constructor(engines) {
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
    loadSearchForAll(
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

    /**
     *
     * @param city
     * @param engine
     * @param checkin
     * @param checkout
     * @param adults
     * @param children
     * @param rooms
     * @param callback
     * @returns {Promise<any>}
     */
    loadSearch(city,
               engine,
               checkin = null,
               checkout = null,
               adults = 1,
               children = 0,
               rooms = 1,
               callback = null) {
        engine = this._engines.filter(e => e.name.toLowerCase() == engine)[0];

        return new Promise(((resolve, reject) => {
            if (engine == null)
                reject(true);

            return engine.search(
                city,
                checkin,
                checkout,
                adults,
                children,
                rooms,
                callback
            ).then(() => {
                CityCrud.setLastScan(city, engine.name).then(() => resolve(true));
            });
        }))
    }

    exists(engine) {
        return this._engines.filter(e => e.name.toLowerCase() == engine.toLowerCase())[0];
    }

    get engines() {
        return this._engines;
    }
}

const fs = require('fs');

const site = './src/sites/';

/**
 *
 * @param from
 * @returns {Array}
 */
const getEngines = (from = '') => {

    if (from !== '')
        from += '/';

    let files = fs.readdirSync(site + from);

    let engines = [];

    files.forEach(f => {
        if (!f.includes('.js'))
            engines = engines.concat(getEngines(from + f));
        else if (f.includes('Engine.js'))
            engines.push(
                require('../sites/' + from + f)
            )
    });

    return engines;
};

/**
 *
 * @type {EnginesManager}
 */
module.exports = new EnginesManager
(
    getEngines()
);
