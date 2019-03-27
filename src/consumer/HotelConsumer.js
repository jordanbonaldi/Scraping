const RabbitMQConsumer = require('./RabbitMQConsumer');

class HotelConsumer extends RabbitMQConsumer
{
    constructor() {
        super('scraping')
    }

    /**
     *
     * @param msg
     */
    consume(msg) {
        return new Promise((resolve) => {
            let hotel = JSON.parse(msg);
            console.log(hotel)
        })
    }
}

/**
 *
 * @type {HotelConsumer}
 */
module.exports = new HotelConsumer();