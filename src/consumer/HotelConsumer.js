const RabbitMQConsumer = require('./RabbitMQConsumer');
const CityCrud = require('../crud/CityCrud');
const {spawn} = require('child_process');
const EngineManager = require('../handlers/EnginesManager');
const {checkDate} = require('../utils/utils');

class HotelConsumer extends RabbitMQConsumer {

    constructor() {
        super('scraping')
    }

    execCommand(name) {
        EngineManager.engines.forEach(e => {
            console.log("Launch of " + e.name + " for " + name);
            console.log('node ./bin/preLaunch ' + e.name.toLowerCase() + ' ' + name.toLowerCase())

            let i = spawn('node', ['./bin/preLaunch', e.name.toLowerCase(), name.toLowerCase()]);

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
