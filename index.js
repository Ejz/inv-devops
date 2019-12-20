const minimist = require('minimist');

function execute(argv) {
    argv = minimist(argv);
}

function register(smth) {
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
