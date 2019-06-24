const RabbitMQConsumer = require('./RabbitMQConsumer');
const CityCrud = require('../crud/CityCrud');
const CountryCrud = require('../crud/CountryCrud');
const {spawn} = require('child_process');
const EngineManager = require('../handlers/EnginesManager');
const {checkDate, log} = require('../utils/utils');

class HotelConsumer extends RabbitMQConsumer {

    constructor() {
        super('scraping')
    }

    execCommand(hotel) {
        EngineManager.engines.forEach(e => {
            log("Launch of " + e.name + " for " + hotel.country + ' - ' + hotel.city);
            log('node ./bin/preLaunch ' + e.name.toLowerCase() + ' ' + hotel.country.toLowerCase() + ' ' + hotel.city.toLowerCase())

            let i = spawn('node', ['./bin/preLaunch', e.name.toLowerCase(), hotel.country.toLowerCase(), hotel.city.toLowerCase()]);

            i.stdout.on('data', data =>
                log(`${name} with ${e.name}: ${data}`)
            );

            i.on('close', code =>
                log(`${name} with ${e.name} finished`)
            );
        })
    }

    /**
     *
     * @param msg
     */
    consume(msg) {
        return new Promise(() => {
            let hotel = JSON.parse(msg);

            return CountryCrud.getByName(hotel.country.toLowerCase()).then((country) =>
              CityCrud.getByName(hotel.city.toLowerCase()).then((doc) => {
                  if (country.cities.includes(doc._id)) {
                      log(checkDate(doc.updatedAt));
                      if (checkDate(doc.updatedAt) > 1/*440*/)
                          this.execCommand(hotel.city)
                  } else this.execCommand(hotel)
              }).catch(() => this.execCommand(hotel))
            )
        })
    }
}

/**
 *
 * @type {HotelConsumer}
 */
module.exports = new HotelConsumer();
