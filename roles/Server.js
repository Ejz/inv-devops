const fs = require('fs');

class Server {
    constructor(name, values, deps = {}) {
        this.name = name;
        this.values = values;
        this.deps = deps;
    }
}

module.exports = Server;
