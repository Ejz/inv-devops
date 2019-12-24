const fs = require('fs');
const path = require('path');

const _ = require('../helpers');
const Role = require('./Role');
const Server = require('./Server');

class Local extends Role {
    constructor(...args) {
        super(...args);
        this.local = this.values.local || {};
        this.SUCCESS_WRITE_SSH_CONFIG = 'WRITE_SSH_CONFIG: %s';
    }

    get home() {
        return this.local.home || '/root';
    }

    get ssh_config() {
        return this.local.ssh_config || '/.ssh/config';
    }

    /**
     * @public
     * @alias write_ssh_config
     * @description Writes servers to .ssh/config, --servers [pattern]
     */
    async writeSshConfig({argv, inventory, quiet}) {
        let servers = this.select(inventory, Server, argv.servers);
        if (!servers.length) {
            let msg = _.sprintf(this.ERROR_NO_OBJECTS_OF_THIS_TYPE, Server.name);
            this.warn(this.writeSshConfig.name, msg);
            return;
        }
        let configs = servers.map(server => server.getSshConfig());
        let config = configs.join('\n');
        let file = this.home + this.ssh_config;
        let content = _.readFile(file);
        for (let server of servers) {
            content = content.replace(server.SSH_CONFIG_PREPEND_REGEX, '');
        }
        content = content ? content.trim() + '\n\n' + config : config;
        _.writeFile(file, content);
        let msg = _.sprintf(this.SUCCESS_WRITE_SSH_CONFIG, file);
        quiet || this.log(this.writeSshConfig.name, msg);
    }
}

Local.file = __filename;
Local.isSingleton = true;

module.exports = Local;
