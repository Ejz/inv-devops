const fs = require('fs');

const _ = require('../helpers');
const Role = require('./Role');

class Server extends Role {
    constructor(...args) {
        super(...args);
        this.server = this.values.server || {};
        this.SSH_CONFIG_PREPEND = _.sprintf('# Automatically generated content (%s)', this.name);
        let s = RegExp.escape(this.SSH_CONFIG_PREPEND) + '[\\s\\S]+?(\\n\\n|$)';
        this.SSH_CONFIG_PREPEND_REGEX = new RegExp(s);
    }

    get host() {
        return this.server.host || 'localhost';
    }

    get ip() {
        return this.server.ip || '127.0.0.1';
    }

    get user() {
        return this.server.user || 'root';
    }

    get port() {
        return this.server.port || '22';
    }

    get inner_ip() {
        return this.server.inner_ip;
    }

    get ssh_proxy_jump() {
        return this.server.ssh_proxy_jump;
    }

    getSshConfig() {
        let collect = [`Host ${this.name}`];
        let {host, ip, user, key, port, inner_ip, ssh_proxy_jump} = this;
        collect.push('Hostname ' + (host || ip || inner_ip || this.name));
        if (user) {
            collect.push('User ' + user);
        }
        if (key) {
            collect.push('IdentityFile ' + key);
            collect.push('PreferredAuthentications publickey');
        }
        if (port) {
            collect.push('Port ' + port);
        }
        if (ssh_proxy_jump) {
            collect.push(`ProxyCommand ssh ${ssh_proxy_jump} -W %h:%p`);
        }
        return this.SSH_CONFIG_PREPEND + '\n' + collect.join('\n') + '\n';
    }

}

Server.file = __filename;

module.exports = Server;
