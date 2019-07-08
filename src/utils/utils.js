const ProcessCrud = require('../crud/ProcessCrud');
const { Parser } = require('json2csv');

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
const sendHotels = (e) => { return obj2csv({data: e, length: e.length, status: 0}) };

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

/**
 *
 * @param id
 * @returns {Promise<any>}
 */
const isProcessRunning = (id) => ProcessCrud.getAll({city: id});

const json2csvParser = new Parser({ ["engines.datas"] });

const obj2csv = json2csvParser.parse(myCars);

    /**
 *
 * @type {{checkDate: (function(*): number)}}
 */
module.exports = {checkDate, normalize, log, getDate, ERROR, sendHotels, getEta, isProcessRunning, getUnique, obj2csv};
