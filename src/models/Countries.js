const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Country = new Schema(
    {
        __id: Schema.Types.ObjectId,
        name: String,
        createdAt: Date,
        updatedAt: Date,
        cities: [{ name:String, city: {type: Schema.Types.ObjectId, ref: 'City'}} ],
        lastScan: {
                city: {type: Schema.Types.ObjectId, ref: 'City'},
                engine: String
        }
    }
);

/**
 *
 * @type {Model}
 */
module.exports = mongoose.model('Country', Country);
