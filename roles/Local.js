const fs = require('fs');

class Local {
    constructor(name, values, deps = {}) {
        this.name = name;
        this.values = values;
        this.deps = deps;
    }
}

module.exports = Local;
