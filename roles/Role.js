const fs = require('fs');

const _ = require('../helpers');

class Role {
    constructor(name, values) {
        this.name = name;
        this.values = values;
        this.ERROR_NO_OBJECTS_OF_THIS_TYPE = 'NO_OBJECTS_OF_THIS_TYPE: %s';
    }

    warn(...args) {
        this._log('31m', this.name, ...args);
    }

    log(...args) {
        this._log('32m', this.name, ...args);
    }

    _log(color, ...args) {
        let col = [];
        while (args.length > 1) {
            col.push(_.sprintf('[\x1b[%s%s\x1b[0m]', color, args.shift()));
        }
        console.log(col.join(' ') + ' ' + args[0]);
    }

    select(inventory, role, select) {
        return _.getObjectsFromInventory(inventory, role, select);
    }
}

Role.file = __filename;

module.exports = Role;
