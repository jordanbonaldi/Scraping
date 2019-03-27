const rabbit = require('amqplib/callback_api');

class RabbitMQConsumer {

    /**
     *
     * @param name
     * @param consume
     */
    constructor(name, consume = 1) {
        this._name = name;
        this._consume = consume
    }

    /**
     *
     * @param msg
     */
    consume(msg) {
        return new Promise((resolve) => {
            resolve(msg)
        })
    }

    /**
     *
     * @param error
     * @param connection
     * @param vm
     */
    channelCreator(error, connection, vm) {
        if (error == null)
            connection.createChannel((err, ch) => {
                ch.consume(vm._name, (msg) => this.consume(msg.content.toString()), {noAck: vm._consume})
            })
    }

    /**
     * connection au amqp via default port
     */
    connect() {
        rabbit.connect('amqp://localhost', (error, connection) =>
            this.channelCreator(error, connection, this)
        )
    }

}

/**
 *
 * @type {RabbitMQConsumer}
 */
module.exports = RabbitMQConsumer;