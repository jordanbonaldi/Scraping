const RabbitMQConsumer = require('./RabbitMQConsumer');
const CityCrud = require('../crud/CityCrud');
const {exec} = require('child_process');
const EngineManager = require('../handlers/EnginesManager');
const {checkDate} = require('../utils/utils');

class HotelConsumer extends RabbitMQConsumer {
    constructor() {
        super('scraping')
    }

    execCommand(name) {
        EngineManager.engines.forEach(e => {
            console.log("Launch of " + e.name + " for " + name);
            exec('node ./bin/preLaunch ' + e.name.toLowerCase() + ' ' + name.toLowerCase())
        })
    }

    /**
     *
     * @param msg
     */
    consume(msg) {
        return new Promise(() => {
            let hotel = JSON.parse(msg);
            CityCrud.getByName(hotel.city.toLowerCase()).then((doc) => {
                console.log(checkDate(doc.updatedAt));
                if (checkDate(doc.updatedAt) > 1/*440*/)
                    this.execCommand(hotel.city)
            }).catch(() => this.execCommand(hotel.city))
        })
    }
}

/**
 *
 * @type {HotelConsumer}
 */
module.exports = new HotelConsumer();
