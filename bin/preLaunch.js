const EngineManager = require('../src/handlers/EnginesManager');
const InformationManager = require('../src/handlers/InformationsManager');
const CityCrud = require('../src/crud/CityCrud');
const ProcessCrud = require('../src/crud/ProcessCrud');
const {checkDate, getDate} = require('../src/utils/utils');
const MongoConnect = require('../src/mongodb/MongoConnect');
const {log} = require('../src/utils/utils');

const isEngineExists = (engine) => EngineManager.exists(engine);

const action = (...datas) => {
    launch(...datas);

    return process.on('SIGINT', () => {
        ProcessCrud.getByNameAndCity(datas[0].toLowerCase(), datas[6].toLowerCase(), getDate(datas[3]), getDate(datas[4]))
            .then((data) => {
                data.running = false;

                return ProcessCrud.updateById(data).then(() => process.exit())
            }).catch(() => {
                log("Non-existing process");
                process.exit();
            });
    })
};

const checkArgsNull = (from, to) => {
    if (process.argv.length < to + 1)
        return false;

    for (let i = from; i < to + 1; i++)
        if (process.argv[i] == null)
            return false;

    return true;
};

const preLaunch = () => {
    let args = process.argv;

    if (args.length === 3) {
        if (args[2] == 'addr')
            InformationManager.launch().then(() =>
                process.exit(0)
            );
        else {
            log("Please enter city name !");
            process.exit(1)
        }

        return;
    }

    if (args.length > 8 && checkArgsNull(2, 8)) {
        let engine = args[2],
            checkin = new Date(Date.parse(args[3])),
            checkout = new Date(Date.parse(args[4])),
            adults = args[5],
            children = args[6],
            country = args[7],
            city = args[8];

        if (args.length > 9)
            for (let i = 9; i < args.length; i++)
                city += ' ' + args[i];

        let _action = () => action(country, city, engine, checkin, checkout, adults, children);

        if (city != null && engine != null) {
            if (!isEngineExists(engine)) {
                log(engine + " unknown!");
                process.exit();
            }

            ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase(), getDate(checkin), getDate(checkout)).then((e) => {

                if (checkDate(e.updatedAt) >= 10)
                    ProcessCrud.deleteById(e).then(_action);
                else if (e.running === false) {
                    e.running = true;
                    ProcessCrud.updateById(e).then(_action)
                } else {
                    log('Process already running');
                    process.exit();
                }
            }).catch(_action);
        }
    } else if (args.length <= 2) require('./server')(); else log("Please use: npm run <engine> <checkin> <checkout> <adults> <children> <country> <city>")
};

MongoConnect().then(preLaunch);


const stop = (err) => process.exit(err);

const launch = (...datas) => EngineManager.loadSearch(...datas).then(() => stop(false)).catch(e => {
    log(e);
    stop(true)
});
