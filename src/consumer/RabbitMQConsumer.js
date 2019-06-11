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
        console.log('Connecting to Channel');
        if (error == null)
            connection.createChannel((err, ch) => {
                console.log('Consumer started !');
                ch.consume(vm._name, (msg) => this.consume(msg.content.toString()), {noAck: vm._consume})
            });
        else
            console.log(error)
    }

    /**
     * connection au amqp via default port
     */
    connect() {
        console.log('Connecting to RabbitMQ');
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
