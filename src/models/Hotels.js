const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hotel = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        city: { type: Schema.Types.ObjectId, ref: 'City'}
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('Hotel', hotel);
