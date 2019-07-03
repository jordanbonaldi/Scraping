const RabbitMQConsumer = require('./RabbitMQConsumer');
const CityCrud = require('../crud/CityCrud');
const CountryCrud = require('../crud/CountryCrud');
const {spawn} = require('child_process');
const EngineManager = require('../handlers/EnginesManager');
const {checkDate, log} = require('../utils/utils');

class CityConsumer extends RabbitMQConsumer {

    constructor() {
        super('scraping')
        this._msg = null;
    }

    /**
     *
     * @param execution
     */
    handleEvents(execution, engine) {
        execution.stdout.on('data', data =>
            console.log(`${data}`)
        );

        execution.on('close', () =>
            console.log(`${this._msg.city} with ${engine} finished`)
        )
    }

    /**
     *
     * Execute child processes
     *
     */
    execCommand() {
        EngineManager.engines.forEach(e => {
            log("Launch of " + e.name + " for " + this._msg.country + ' - ' + this._msg.city);

            this.handleEvents(spawn('node', [
                './bin/preLaunch',
                e.name.toLowerCase(),
                this._msg.from,
                this._msg.to,
                this._msg.adults,
                this._msg.children,
                this._msg.country.toLowerCase(),
                this._msg.city.toLowerCase()
            ]), e.name);
        })
    }

    /**
     *
     * @param msg
     */
    consume(msg) {
        this._msg = JSON.parse(msg);

        return CountryCrud.getByName(this._msg.country.toLowerCase()).then((country) =>
              CityCrud.getByName(this._msg.city.toLowerCase()).then((doc) => {
                  if (country.cities.filter(e => String(e.city).localeCompare(String(doc._id)) === 0)[0]) {
                      log(checkDate(doc.updatedAt));
                      if (checkDate(doc.updatedAt) > 1/*440*/) /** check date **/
                          this.execCommand()
                  } else log("Already checked city")
              }).catch((e) => {
                  console.log(e)
                  this.execCommand()
              })
            ).catch((e) => {
                console.log(e)
                this.execCommand()
            })
    }
}

/**
 *
 * @type {HotelConsumer}
 */
module.exports = new CityConsumer();
