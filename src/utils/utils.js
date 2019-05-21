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
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(message);
};

/**
 *
 * @type {{checkDate: (function(*): number)}}
 */
module.exports = {checkDate, normalize, log};
