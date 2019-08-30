const CityCrud = require('../crud/CityCrud');
const ProcessCrud = require('../crud/ProcessCrud');
const {log, getDate} = require('../utils/utils');

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
     * @param engine
     * @param country
     * @param city
     * @param checkin
     * @param checkout
     * @param adults
     * @param children
     * @param rooms
     * @param callback
     * @returns {Promise|*|PromiseLike<any>|Promise<any>}
     */
    explodeSearch(engine,
                  country,
                  city,
                  checkin = null,
                  checkout = null,
                  adults = 1,
                  children = 0,
                  rooms = 1,
                  callback = null
    ) {

        if (checkin == null || checkout == null)
            return engine.search(country, city, checkin, checkout, adults, children, rooms, callback);

        if (checkin < checkout) {
            console.log("Loading date " + getDate(checkin));
            let _checkout = new Date();
            _checkout.setDate(checkin.getDate() + 1);
            return engine.search(country, city, checkin, _checkout, adults, children, rooms, callback).then(() =>
                ProcessCrud.getByName(engine.name.trim().toLowerCase())
                    .then((d) =>ProcessCrud.deleteById(d)).then(() => {
                        log(getDate(checkin) + " finished in " + Math.round(engine.getFrequences()) + "seconds\n");
                        checkin.setDate(checkin.getDate() + 1);
                        return this.explodeSearch(engine, country, city, checkin, checkout, adults, children, rooms, callback)
                    })
            )
        }
    }

    /**
     *
     * @param country
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
    loadSearch(country,
               city,
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

            return this.explodeSearch(
                engine,
                country,
                city,
                checkin,
                checkout,
                adults,
                children,
                rooms,
                callback
            ).then(() => {
                log("Finished!");

                return CityCrud.setLastScan(city.toLowerCase(), engine.name).then(() => resolve(true)).catch()
            }).catch(e => reject(e))
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
