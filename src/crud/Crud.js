class Crud {
    constructor(name, model) {
        this.name = name;
        this.model = model;
    }

    create(data) {
        return new Promise((resolve, reject) => {
            let date = new Date();
            data = {
                ...data,
                _createdAt: date,
                _updatedAt: date
            };
            this.model.create(data, (err, doc) => {
                    if (err) reject(true);
                    else {
                        Crud.removeDbField(doc);
                        resolve(doc);
                    }
                }
            )
        });
    }

    get(identifier = {}) {
        return new Promise((resolve, reject) => {
            this.model.find(identifier, (err, docs) => {
                if (err) reject(true);
                else {
                    docs.forEach(doc => Crud.removeDbField(doc));
                    resolve(docs);
                }
            })
        });
    };

    update(data, identifier = {}) {
        return new Promise((resolve, reject) => {
            data._updatedAt = new Date();
            this.model.updateOne(identifier, data, (err, res) => {
                    (err)
                        ? reject(true)
                        : resolve(res);
                }
            )
        });
    };

    delete(identifier = {}) {
        return new Promise((resolve, reject) => {
            this.model.deleteMany(identifier, (err, result) => {
                if (err) reject(true);
                else if (!result.n) reject(true);
                else resolve("Success");
            })
        });
    };

    getOne(identifier = {}) {
        return new Promise((resolve, reject) => {
            this.model.find(identifier, (err, docs) => {
                if (err) reject(true);
                else if (!docs.length) reject(true);
                else {
                    Crud.removeDbField(docs[0]);
                    resolve(docs[0]);
                }
            })
        });
    };

    updateById(data) {
        return this.update(data, { 'id': data.id })
    }

    deleteById(id) {
        return this.delete({ 'id': id })
    }

    static removeDbField(doc) {
        Object.getOwnPropertyNames(doc._doc).forEach(prop => {
            if (prop.slice(0, 1) === '_')
                delete doc._doc[prop];
        })
    };
}

module.exports = Crud;