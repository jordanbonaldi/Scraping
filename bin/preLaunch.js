const EngineManager = require('../src/handlers/EnginesManager');
const InformationManager = require('../src/handlers/InformationsManager');
const ProcessCrud = require('../src/crud/ProcessCrud');
const {checkDate} = require('../src/utils/utils');
const MongoConnect = require('../src/mongodb/MongoConnect');

const isEngineExists = (engine) => EngineManager.exists(engine);

const action = (engine, country, city) => {
    launch(country, city, engine);

    return process.on('SIGINT', () => {
        ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase())
            .then((data) => {
                data.running = false;

                return ProcessCrud.updateById(data).then(() => process.exit())
            }).catch(() => {
                console.log("Non-existing process");
                process.exit();
            });
    })
};

const preLaunch = () => {
    let args = process.argv;

    if (args.length === 3) {
        if (args[2] == 'addr')
            InformationManager.launch().then(() =>
                process.exit(0)
            );
        else {
            console.log("Please enter city name !");
            process.exit(1)
        }

        return;
    }

    if (args.length > 4) {
        let engine = args[2];
        let country = args[3];
        let city = args[4];

        if (args.length > 5)
            for (let i = 5; i < args.length; i++)
                city += ' ' + args[i];

        if (city != null && engine != null) {
            if (!isEngineExists(engine)) {
                console.log(engine + " unknown!");
                process.exit();
            }

            ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase()).then((e) => {

                if (checkDate(e.updatedAt) >= 10)
                    ProcessCrud.deleteById(e).then(() => action(engine, country, city));
                else if (e.running === false) {
                    e.running = true;
                    ProcessCrud.updateById(e).then(() => action(engine, country, city))
                } else {
                    console.log('Process already running');
                    process.exit();
                }
            }).catch(() => action(engine, country, city));
        }
    } else require('./server')()
};

MongoConnect().then(preLaunch);


const stop = (err) => process.exit(err);

const launch = (country, city, engine) => EngineManager.loadSearch(country, city, engine).then(() => stop(false)).catch(e => {
    console.log(e);
    stop(true)
});
