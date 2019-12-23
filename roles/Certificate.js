const fs = require('fs');

const _ = require('../helpers');
const Role = require('./Role');

class Certificate extends Role {
    constructor(...args) {
        super(...args);
        this.certificate = this.values.certificate || {};
    }
}

Certificate.file = __filename;

module.exports = Certificate;
