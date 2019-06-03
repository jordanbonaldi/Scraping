const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let City = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        lastScan: String,
        createdAt: Date,
        updatedAt: Date,
        hotels: Number
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('City', City);
