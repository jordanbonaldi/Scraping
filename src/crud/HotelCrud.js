const Crud = require('../crud/Crud');
const Hotel = require('../models/Hotels');

class HotelCrud extends Crud {
    constructor() {
        super('hotel', Hotel);
    }

    create(data) {
        let title = data.title;
        console.log(data.city);
        return this.getByName(title).then(() => {
            return {
                error: "Already existing hotel"
            }
        }).catch(() => {
            return super.create(data);
        })
    }

    getByName(name) {
        return this.getOne({title: name});
    }

}

module.exports = new HotelCrud();
