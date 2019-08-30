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
 * @param a
 * @param checkin
 * @param checkout
 * @returns {Promise<any | void>}
 */
const filterMyDate = (a, checkin, checkout) => {
    checkout = new Date(checkout);

    a.forEach(b => b.engines.forEach(obj => {
        let data = [];
        for (let d = new Date(checkin); d < checkout; d.setDate(d.getDate() + 1))
            data.push(obj.datas.filter(data => data.from === getDate(d))[0]);
        data = data.filter(e => e != null);
        obj.datas = data;
    }));

    return a
};

const getDatedObject = (obj, fromDate, toDate) => {
  obj.data = filterMyDate(obj.data, fromDate, toDate);

  return obj;
};

/**
 *
 * @param e
 * @param format
 * @param fromDate
 * @param toDate
 * @returns {{data: *, length: *, status: number}}
 */
const sendHotels = (e, format, fromDate = null, toDate = null) => {
    let obj = { data: e, length: e.length, status: 0};

    return format === 'csv' ? hotelsJsonToCsv(obj, fromDate, toDate) : (fromDate != null && toDate != null ? getDatedObject(obj, fromDate, toDate) : obj);
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

/**
 *
 * @param date
 * @param data
 */
const getCheaperDateInData = (data, date) => {
    let prices = [];

    data.forEach(eng => {
        let engine = eng.datas.filter(a =>
            a.price != null && a.from == getDate(date)
        )[0];

        prices.push({
            engine: eng.name,
            price: engine != null ? parseFloat(engine.price) : null
        })
    });

    prices = prices.filter(x => x != null && x.price != null);

    let reduced = null;

    if (prices.length > 0)
        reduced = prices.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

    return reduced != null && reduced.price != null ? reduced.engine + ": " + reduced.price : "n/a";
};

const hotelsJsonToCsv = (json, fromDate, toDate) => {
    let header = "name|address|rate|";
    toDate = new Date(toDate);

    for (let d = new Date(fromDate); d < toDate; d.setDate(d.getDate() + 1))
        header += getDate(d) + '|';

    let content = [];

    json.data.forEach(e => {
        let hotels = [e.name, e.address, e.rate];

        for (let d = new Date(fromDate); d < toDate; d.setDate(d.getDate() + 1))
            hotels.push(getCheaperDateInData(e.engines, d));

        content.push(hotels)
    });

    for (let i = 0; i < content.length; i++)
        if (content[i+1] != null && content[i].length < content[i+1].length)
            content[i].push("n/a");

    content = content.map(e => e.join('|'));

    header = header.substr(0, header.length - 1);
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
module.exports = {checkDate, normalize, log, getDate, ERROR, sendHotels, getEta, isProcessRunning, getUnique, hotelsJsonToCsv, nameComparator, filterMyDate};
