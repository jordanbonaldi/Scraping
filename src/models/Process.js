const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Process = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        percent: Number,
        max: Number,
        current: Number,
        chunk: Number,
        perChunk: Number,
        eta: Number,
        createdAt: Date,
        updatedAt: Date
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('Process', Process);
