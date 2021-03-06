const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const CityConsumer = require('./src/consumer/CityConsumer');

/**
 * Launch du RabbitMQ Consumer
 */
CityConsumer.connect();

const hotelsRouter = require('./src/routes/HotelsRouter');
const competitorRouter = require('./src/routes/CompetitorRouter');
const cityRouter = require('./src/routes/CityRouter');

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
    app.use('/', competitorRouter);
    app.use('/', cityRouter);
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
    });

};

initApp();

module.exports = app;
