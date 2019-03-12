const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hotel = new Schema(
    {
        __id: Schema.Types.ObjectId,
        title: String,
        city: { type: Schema.Types.ObjectId, ref: 'City'}
    }
);

module.exports = mongoose.model('Hotel', hotel);
