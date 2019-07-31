const ProcessCrud = require('../crud/ProcessCrud');
const Similarity = require('string-similarity');

/**
 *
 * @param date
 * @returns {number}
 */
const checkDate = (date) => Math.abs(((new Date().getTime() - date.getTime()) / 1000)/60);

/**
 *
 * @param name
 * @returns {string}
 */
const normalize = (name) => name.normalize('NFD').toLowerCase()
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace('hotel', '');

/**
 *
 * @param message
 */
const log = (message) => {
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    // process.stdout.write(message);
    let now = new Date().toTimeString().split(' ')[0];
    console.log(`[${now}] ${message}`)
};

/**
 *
 * @param name
 * @param instance
 * @returns {Promise<unknown>}
 */
const nameComparator = (name, instance) => instance.getAll().then(e => {
        let names = e.map(i => normalize(i.name));
        let agv = Similarity.findBestMatch(normalize(name), names);
        let res = e.filter(i => normalize(i.name) === agv.bestMatch.target)[0];

        return new Promise((resolve, reject) =>
            agv.bestMatch.rating > 0.81 ? resolve(res) : reject(Error("Not enough percent")));
    });

/**
 *
 * @param a
 * @returns {*}
 */
const getUnique = (a) => {
    let seen = new Set();
    return a.filter(item => {
        let k = Object.keys(item);
        return seen.has(k) ? false : seen.add(k);
    });
};

/**
 *
 * @param date
 */
const getDate = (date) => {
    let month = date.getMonth()+1;
    month = month < 10 ? '0' + month : month;
    return date.getFullYear()+'-'+ month + '-' + date.getDate();
};

/**
 * Router error
 *
 * @type {{status: number}}
 */
const ERROR = {
    status: -1
};

/**
 *
 * @param e
 * @returns {{data: *, length: *, status: number}}
 */
const sendHotels = (e, format) => {
    let obj = { data: e, length: e.length, status: 0};

    return format == 'csv' ? hotelsJsonToCsv(obj) : obj
};



/**
 *
 * @param processes
 * @returns {{running: *, current: *, perChunk: *, eta: *, max: *, chunk: *, percent: number, status: number}}
 */
const getEta = (processes) => {
    processes = processes.filter(a => checkDate(a.updatedAt) < 10);
    let sumHotels = processes.reduce((a, b) => a + b.current, 0);
    let sumMax = processes.reduce((a, b) => a + b.max, 0);

    let pct = Math.round((sumHotels*100)/sumMax);

    return {
        current: sumHotels,
        max: sumMax,
        percent: pct,
        eta: processes.reduce((a, b) => a + b.eta, 0),
        chunk: processes.reduce((a, b) => a + b.chunk, 0),
        perChunk: processes.reduce((a, b) => a + b.perChunk, 0),
        running: processes,
        status: 1
    }
};

const hotelsJsonToCsv = (json) => {
    let header = "name|address|rate|";
    let dates = [];

    json.data.forEach(e => {
       e.engines[0].datas.filter(a => a.price != null).forEach(a => {
           if (!dates.includes(a.from))
               dates.push(a.from)
       })
    });

    header += dates.join("|");

    let content = [];

    json.data.forEach(e => {
        let hotels = [e.name, e.address, e.rate];
        let tmp_date = [];
        e.engines.forEach(eng =>
            eng.datas.filter(a => a.price != null).forEach(a => {
                if (!tmp_date.includes(a.from)) {
                    hotels.push(e.engines[0].name + ": " + a.price);
                    tmp_date.push(a.from);
                }
            })
        );
        content.push(hotels);
    });

    for (let i = 0; i < content.length; i++)
        if (content[i+1] != null && content[i].length < content[i+1].length)
            content[i].push("n/a");

    content = content.map(e => e.join('|'));

    return header + '\n' + content.join('\n')
};

/**
 *
 * @param id
 * @returns {Promise<any>}
 */
const isProcessRunning = (id) => ProcessCrud.getAll({city: id});



    /**
 *
 * @type {{checkDate: (function(*): number)}}
 */
module.exports = {checkDate, normalize, log, getDate, ERROR, sendHotels, getEta, isProcessRunning, getUnique, hotelsJsonToCsv, nameComparator};
