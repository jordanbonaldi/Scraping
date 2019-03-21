const Generator = require('../../handlers/Generator');

class TripAdvisorGenerator extends Generator {

    /**
     *
     * @param value
     * @returns {string}
     */
    addOffSet(value) {
        let array = this._baseUrl.split('-');
        array.splice(2, 0, 'oa' + value);

        return array.join('-');
    }

}

/**
 *
 * @type {TripAdvisorGenerator}
 */
module.exports = TripAdvisorGenerator;
