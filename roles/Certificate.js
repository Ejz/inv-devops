const fs = require('fs');

const _ = require('../helpers');
const Role = require('./Role');

class Certificate extends Role {
    constructor(...args) {
        super(...args);
        this.certificate = this.values.certificate || {};
        this.ERROR_READY_TO_EXPIRE = 'READY_TO_EXPIRE';
    }

    get privkey() {
        return this.certificate.privkey;
    }

    get cert() {
        return this.certificate.cert;
    }

    get chain() {
        return this.certificate.chain;
    }

    get fullchain() {
        return this.cert + this.chain;
    }

    async getInfo() {
        let info = {};
        let res;
        res = await this.exec(`
            echo ? |
            openssl x509 -noout -dates |
            cut -d"=" -f2- |
            tail -1
        `, this.fullchain);
        info.date = new Date(res);
        res = await this.exec(`
            cat ? |
            openssl x509 -noout -text |
            grep -oP ?
        `, this.fullchain, '(?<=DNS:)[^,\\s]+');
        info.san = _.nsplit(res);
        info.days = parseInt((info.date - Number(new Date())) / (1000 * 3600 * 24));
        return info;
    }

    /**
     * @public
     * @alias is_ready_to_expire
     * @description Check certificate
     */
    async isReadyToExpire({argv, inventory, quiet}) {
        let info = await this.getInfo();
        if (info.days <= 14) {
            this.warn(this.ERROR_READY_TO_EXPIRE);
        }
    }
}

Certificate.file = __filename;

module.exports = Certificate;
