const {Query} = require('./Query');
const City = require('../crud/CityCrud');
const Hotel = require('../crud/HotelCrud');
const request = require('request-promise');
const ProcessCrud = require('../crud/ProcessCrud');

class Information
{
    constructor(name, url, searchClass, queryClass, ...queries) {
        this._name = name;
        this._url = url;
        this._query = new queryClass(queries);
        this._search = new searchClass();
        this._hotels = [];
    }

    loadHotels() {
        this._hotels = Hotel.getAll({address: 'none'})
    }

    _actionToPerform(engine) {
        return engine.hasOwnProperty('id') && engine.id > 0;
    }

    _getCorrespondingEngine(hotel) {
        return hotel.engines.filter(e => e.name.toLowerCase() == this._name.toLowerCase())[0];
    }

    loadProcedure() {
        this._hotels.forEach(e => {
            let engine = this._getCorrespondingEngine(e);

            if (this._actionToPerform(engine)) {
                //load direct url
            } else {
               // get url with lookup
            }
        })
    }

    getInformations(data) {
        return []
    }


}
