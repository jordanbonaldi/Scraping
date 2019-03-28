const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config');

const HotelConsumer = require('./src/consumer/HotelConsumer');

/**
 * Launch du RabbitMQ Consumer
 */
HotelConsumer.connect();

require('./src/handlers/EnginesManager')();

const hotelsRouter = require('./src/routes/HotelsRouter');

const app = express();

app.use(cors());

const initApp = () => {
    app.use(express.static(path.join(__dirname, '/')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
        next()
    });

    app.use('/', hotelsRouter);
// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404))
    });

// error handler
    app.use(function(err, req, res) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error')
    })
};

const tryMongoConnection = () => new Promise((resolve) => {
    mongoose.connect(config.mongo, {useNewUrlParser: true})
        .then(() => { console.log('[Mongo] Connected'); resolve() })
        .catch(e => { console.log('[Mongo]', e.message); console.log('[Mongo] Retrying to connect in a few seconds...') })
});

const connectToMongo = () => new Promise((resolve) => {
    let interval = setInterval(() => {
        tryMongoConnection()
            .then(() => {
                clearInterval(interval);
                resolve()
            })
    }, 3000)
});

connectToMongo().then(initApp);

module.exports = app;
