const minimist = require('minimist');
const _ = require('./helpers');
const fs = require('fs');

let registered = [];

function execute(inventory, argv) {
    inventory = _.inventory(inventory);
    argv = minimist(argv);
    console.log(inventory);
    console.log(argv);
    console.log(registered);
}

function register(smth) {
    if (_.isFunction(smth)) {
        registered.push(smth);
    } else if (_.isDirectory(smth)) {
        fs.readdirSync(smth).filter(f => _.isFile(f)).forEach(f => {
            registered.push(require(f));
        });
    }
}

let roles = {
    get Local() {
        return require('./roles/Local');
    },
    get Server() {
        return require('./roles/Server');
    },
    get Certificate() {
        return require('./roles/Certificate');
    },
};

module.exports = {
    register,
    roles,
    execute,
};
