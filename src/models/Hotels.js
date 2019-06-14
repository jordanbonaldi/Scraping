const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hotel = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        city: { type: Schema.Types.ObjectId, ref: 'City'},
        address: String,
        engines: [{
                name: String,
                rate: String,
                reviews: String,
                datas: [{
                        from: String,
                        to: String,
                        rooms: Number,
                        adults: Number,
                        children: Number,
                        price: String
                }]
        }],
        rate: Number,
        validated: Boolean,
        createdAt: Date,
        updatedAt: Date
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('Hotel', hotel);
