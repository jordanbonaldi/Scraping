const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let City = new Schema(
    {
        __id: Schema.Types.ObjectId,
        title: String,
        postalCode: String,
        country: String,
        hotels: [{type: Schema.Types.ObjectId, ref: 'Hotel'}]
    }
);

module.exports = mongoose.model('City', City);
