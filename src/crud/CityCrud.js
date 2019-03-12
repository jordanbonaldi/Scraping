const Crud = require('../crud/Crud');
const City = require('../models/Cities');

class CityCrud extends Crud {
    constructor() {
        super('city', City);
    }

    create(data) {
        let title = data.title;
        data.hotels = [];
        return this.getByName(title).then(() => {
            return {
                error: "Already existing city"
            }
        }).catch(() => {
            return super.create(data);
        })
    }

    addHotel(city, hotel) {
        return this.getByName(city).then((data) => {
            data.hotels.push(hotel._id);

            this.update(data, {title: city});
        })
    }

    getByName(name) {
        return this.getOne({title: name});
    }

}

module.exports = new CityCrud();
