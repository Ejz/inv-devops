const fs = require('fs');

class Certificate {
    constructor(name, values, deps = {}) {
        this.name = name;
        this.values = values;
        this.deps = deps;
    }
}

module.exports = Certificate;
