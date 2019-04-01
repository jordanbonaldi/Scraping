const server = require('./server');
const EngineManager = require('../src/handlers/EnginesManager');

let args = process.argv;

if (args.length > 3) {
    let engine = args[2];
    let city = args[3];

    if (city != null && engine != null)
        EngineManager.loadSearch(city, engine)
            .then(() => process.exit(0))

} else server();


