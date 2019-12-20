const fs = require('fs');

/**
 * @Class();
 * @isStatic(true);
 */
class Local {
    constructor(name, values) {
        this.name = name;
        this.values = values;
    }

    /**
     * @Method("writeSshConfig");
     * @requires([{"role": "Server", "alias": "servers", "pattern": "*"}]);
     */
    async writeSshConfig({servers}, argv) {
    }
}

Local.file = __filename;

module.exports = Local;
