const mongoose = require('mongoose');
const config = require('./config/config');

const HotelConsumer = require('./src/consumer/HotelConsumer');

HotelConsumer.connect();

const EnginesManager = require('./src/handlers/EnginesManager');

const tryMongoConnection = () => new Promise((resolve) => {
  mongoose.connect(config.mongo, {useNewUrlParser: true})
      .then(() => { console.log('[Mongo] Connected'); resolve() })
      .catch(e => { console.log('[Mongo]', e.message); console.log('[Mongo] Retrying to connect in a few seconds...') });
});

const connectToMongo = () => new Promise((resolve) => {
  let interval = setInterval(() => {
    tryMongoConnection()
        .then(() => {
          clearInterval(interval);
          resolve();
        });
  }, 3000);
});

connectToMongo().then(() => {
  EnginesManager();
});
