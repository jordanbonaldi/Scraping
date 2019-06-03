const EngineManager = require('../src/handlers/EnginesManager');
const InformationManager = require('../src/handlers/InformationsManager');
const ProcessCrud = require('../src/crud/ProcessCrud');
const {checkDate} = require('../src/utils/utils');
const MongoConnect = require('../src/mongodb/MongoConnect');

const isEngineExists = (engine) => EngineManager.exists(engine);

const action = (engine, city) => {
    launch(city, engine);

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

    if (args.length > 3) {
        let engine = args[2];
        let city = args[3];

        if (args.length > 4)
            for (let i = 4; i < args.length; i++)
                city += ' ' + args[i];

        if (city != null && engine != null) {
            if (!isEngineExists(engine)) {
                console.log(engine + " unknown!");
                process.exit();
            }

            ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase()).then((e) => {

                if (checkDate(e.updatedAt) >= 10)
                    ProcessCrud.deleteById(e).then(() => action(engine, city));
                else if (e.running === false) {
                    e.running = true;
                    ProcessCrud.updateById(e).then(() => action(engine, city))
                } else {
                    console.log('Process already running');
                    process.exit();
                }
            }).catch(() => action(engine, city));
        }
    } else require('./server')()
};

MongoConnect().then(preLaunch);


const stop = (err) => process.exit(err);

const launch = (city, engine) => EngineManager.loadSearch(city, engine).then(() => stop(false)).catch(e => {
    console.log(e);
    stop(true)
});
