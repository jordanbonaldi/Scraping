class BookingEngine {

    /**
     * @param generator
     */
    constructor(generator) {
        this.url = generator.generateUrl();
        console.log(this.url);
    }

}

/**
 *
 * @type {BookingEngine}
 */
module.exports = BookingEngine;
