const fs = require('fs');
const child_process = require('child_process');

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

    exec(cmd, ...args) {
        cmd = _.format(cmd, ...args);
        this.log(this.exec.name, cmd);
        return new Promise((res, rej) => {
            child_process.exec(cmd, {
                shell: '/bin/bash',
                maxBuffer: 1E9,
            }, (err, stdout, stderr) => {
                if (!err) {
                    res(stdout);
                    return;
                }
                this.warn(this.exec.name, err.code, stderr.trim());
                rej([[err.code, stdout, stderr]]);
            });
        });
    }
}

Role.file = __filename;

module.exports = Role;
