const Crud = require('../crud/Crud');
const Process = require('../models/Process');

class ProcessCrud extends Crud {

    constructor() {
        super('Process', Process);
    }

    /**
     *
     * @param data
     * @returns {Promise<T | never>}
     */
    create(data) {
        console.log(data);
        let name = data.name;

        return this.getByName(name).then((currentData) => {
            data._id = currentData._id;
            return super.updateById(data)
        }).catch(() => {
            return super.create(data);
        })
    }

    /**
     *
     * @param name
     */
    getByName(name) {
        return this.getOne({name: name});
    }

}

/**
 *
 * @type {ProcessCrud}
 */
module.exports = new ProcessCrud();
