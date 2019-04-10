const mongoose = require('mongoose');
const config = require('../../config/config');

/**
 *
 * @returns {Promise<any>}
 */
const tryMongoConnection = () => new Promise((resolve) => {
    mongoose.connect(config.mongo, {useNewUrlParser: true})
        .then(() => { console.log('[Mongo] Connected'); resolve() })
        .catch(e => { console.log('[Mongo]', e.message); console.log('[Mongo] Retrying to connect in a few seconds...') })
});

/**
 *
 * @returns {Promise<any>}
 */
const connectToMongo = () => new Promise((resolve) => {
    let interval = setInterval(() => {
        tryMongoConnection()
            .then(() => {
                clearInterval(interval);
                resolve()
            })
    }, 3000)
});

/**
 *
 * @type {function(): Promise<any>}
 */
module.exports = connectToMongo;
