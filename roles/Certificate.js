const fs = require('fs');

class Certificate {
    constructor(name, values) {
        this.name = name;
        this.values = values;
    }
}

Certificate.file = __filename;

module.exports = Certificate;
