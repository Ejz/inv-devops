const os = require('os');

const ERROR_NO_ROLE = 'NO_ROLE';
const ERROR_NO_METHOD = 'NO_METHOD: %s';
const ERROR_INVALID_ROLE = 'INVALID_ROLE: %s';
const ERROR_INVALID_METHOD = 'INVALID_METHOD: %s';
const ERROR_NO_SINGLETON_ROLE = 'NO_SINGLETON_ROLE: %s';
const ERROR_JUST_ONE_SINGLETON_ROLE = 'JUST_ONE_SINGLETON_ROLE: %s';
const ERROR_NO_PATTERN = 'ERROR_NO_PATTERN';

class InvError extends Error {
    toString() {
        return 'ERROR: ' + this.message;
    }
}

module.exports = {
    TMPDIR: os.tmpdir(),
    ROOT: __dirname,
    InvError,
    ERROR_NO_ROLE,
    ERROR_NO_METHOD,
    ERROR_INVALID_ROLE,
    ERROR_INVALID_METHOD,
    ERROR_NO_SINGLETON_ROLE,
    ERROR_JUST_ONE_SINGLETON_ROLE,
    ERROR_NO_PATTERN,
};
