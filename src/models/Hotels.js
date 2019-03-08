const mongoose = require('mongoose');

let hotel = new mongoose.Schema(
    {
        title: { type: String }
    },
    { collection: 'hotels' }
);

module.exports = mongoose.model('Hotel', hotel);
