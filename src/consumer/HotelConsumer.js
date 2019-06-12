const RabbitMQConsumer = require('./RabbitMQConsumer');
const CityCrud = require('../crud/CityCrud');
const CountryCrud = require('../crud/CountryCrud');
const {spawn} = require('child_process');
const EngineManager = require('../handlers/EnginesManager');
const {checkDate} = require('../utils/utils');

class HotelConsumer extends RabbitMQConsumer {

    constructor() {
        super('scraping')
    }

    execCommand(hotel) {
        EngineManager.engines.forEach(e => {
            console.log("Launch of " + e.name + " for " + hotel.country + ' - ' + hotel.city);
            console.log('node ./bin/preLaunch ' + e.name.toLowerCase() + ' ' + hotel.country.toLowerCase() + ' ' + hotel.city.toLowerCase())

            let i = spawn('node', ['./bin/preLaunch', e.name.toLowerCase(), hotel.country.toLowerCase(), hotel.city.toLowerCase()]);

            i.stdout.on('data', data =>
                console.log(`${name} with ${e.name}: ${data}`)
            );

            i.on('close', code =>
                console.log(`${name} with ${e.name} finished`)
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
                      console.log(checkDate(doc.updatedAt));
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
