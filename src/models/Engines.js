const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let engine = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        price: String,
        rate: String,
        reviews: Number
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('Engine', engine);
