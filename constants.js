const os = require('os');

const ERROR_NO_ROLE = 'NO_ROLE';
const ERROR_INVALID_ROLE = 'INVALID_ROLE: %s';
const ERROR_INVALID_METHOD = 'INVALID_METHOD: %s';
const ERROR_NO_STATIC_ROLE = 'NO_STATIC_ROLE: %s';
const ERROR_JUST_ONE_STATIC_ROLE = 'JUST_ONE_STATIC_ROLE: %s';
const ERROR_NO_PATTERN = 'ERROR_NO_PATTERN';

module.exports = {
    TMPDIR: os.tmpdir(),
    ROOT: __dirname,
    ERROR_NO_ROLE,
    ERROR_INVALID_ROLE,
    ERROR_INVALID_METHOD,
    ERROR_NO_STATIC_ROLE,
    ERROR_JUST_ONE_STATIC_ROLE,
    ERROR_NO_PATTERN,
    get ERRORS() {
        return Object.keys(this).filter(k => /^ERROR_/.test(k)).reduce(
            (obj, key) => ({...obj, [key]: this[key]}),
            {}
        );
    },
};
