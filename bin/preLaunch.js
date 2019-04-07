const server = require('./server');
const EngineManager = require('../src/handlers/EnginesManager');
const ProcessCrud = require('../src/crud/ProcessCrud');

const isEngineExists = (engine) => EngineManager.exists(engine);
const checkDate = (date) => Math.abs(((new Date().getTime() - date.getTime()) / 1000)/60);

const action = (engine, city) => {
    launch(city, engine);

    return process.on('SIGINT', () => {
        ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase())
            .then((data) => {
                data.running = false;

                return ProcessCrud.updateById(data).then(() => process.exit())
            }).catch(() => console.log("Non-existing process"));
    })
};

let args = process.argv;

if (args.length === 3) {
    console.log("Please enter city name !");
    process.exit(1)
}

if (args.length > 3) {
    let engine = args[2];
    let city = args[3];

    if (city != null && engine != null) {
        if (!isEngineExists(engine)) {
            console.log(engine + " unknown!");
            process.exit();
        }

        ProcessCrud.getByNameAndCity(engine.toLowerCase(), city.toLowerCase()).then((e) => {
            console.log(checkDate(e.updatedAt));

            if (checkDate(e.updatedAt) >= 10) {
                console.log(e);
                ProcessCrud.deleteById(e).then(() => action(engine, city))
            } else if (e.running === false) {
                e.running = true;
                ProcessCrud.updateById(e).then(() => action(engine, city))
            } else {
                console.log('Process already running');
                process.exit();
            }
        }).catch(() => action(engine, city));
    }
} else server();

const launch = (city, engine) => EngineManager.loadSearch(city, engine).then(() => process.exit(0));