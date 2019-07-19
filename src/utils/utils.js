const ProcessCrud = require('../crud/ProcessCrud');
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
 * @param a
 * @returns {*}
 */
const getUnique = (a) => {
    let seen = new Set();
    return a.filter(item => {
        let k = key(item);
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
const sendHotels = (e) => { return { data: e, length: e.length, status: 0} };

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
    let header = "name, address, rate, ";
    let dates = [];

    json.data.forEach(e => {
       e.engines[0].datas.filter(a => a.price != null).forEach(a => {
           if (!dates.includes(a.from))
               dates.push(a.from)
       })
    });

    header += dates.join(", ");

    let content = [];

    json.data.forEach(e => {
        let string = e.name + ", " + e.address + ", " + e.rate + ", ";
        let tmp_date = [];
        e.engines[0].datas.filter(a => a.price != null).forEach(a => {
            if (!tmp_date.includes(a.from)) {
                string += e.engines[0].name + ": " + a.price + ", ";
                tmp_date.push(a.from);
            }
        });
        content.push(string);
    });
    console.log(header + '\n' + content.join('\n'))
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
module.exports = {checkDate, normalize, log, getDate, ERROR, sendHotels, getEta, isProcessRunning, getUnique, hotelsJsonToCsv};
