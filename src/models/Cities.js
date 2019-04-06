const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let City = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        createdAt: Date,
        updatedAt: Date
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('City', City);
