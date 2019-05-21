const CityCrud = require('../crud/CityCrud');
const ProcessCrud = require('../crud/ProcessCrud');
const {log} = require('../utils/utils');

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
                log("Finished for " + city);
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
                ProcessCrud.getByName(engine.name.trim().toLowerCase())
                    .then((d) => ProcessCrud.deleteById(d._id))
                    .catch(() => console.log('No process to delete'));

                log(
                    "Finished for " +
                    city +
                    " with " +
                    engine.name +
                    " in " +
                    Math.round(engine.getFrequences()) +
                    " seconds\n"
                );

                return CityCrud.setLastScan(city.toLowerCase(), engine.name).then(() => resolve(true)).catch()
            }).catch(e => reject('Error : ' + e));
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
