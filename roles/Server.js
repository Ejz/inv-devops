const fs = require('fs');

class Server {
    constructor(name, values) {
        this.name = name;
        this.values = values;
    }
}

Server.file = __filename;

module.exports = Server;
