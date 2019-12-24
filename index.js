const minimist = require('minimist');
const fs = require('fs');

const _ = require('./helpers');
const C = require('./constants');

let roles = {};

function register(smth) {
    if (_.isFunction(smth)) {
        roles[smth.name] = smth;
    } else if (_.isDirectory(smth)) {
        fs.readdirSync(smth).forEach(f => {
            let n = f.replace('.js', '');
            f = [smth, f].join('/');
            if (_.isFile(f)) {
                roles = {...roles, get [n]() { return require(f); }};
            }
        });
    }
}

register(C.ROOT + '/roles');

async function execute(inventory, argv) {
    inventory = _.inventory(inventory, roles);
    argv = minimist(argv);
    let command = argv._.shift();
    if (command === undefined) {
        throw new C.InvError(C.ERROR_NO_ROLE);
    }
    let found;
    command = command.split(':');
    let role = command.shift();
    found = Object.keys(roles).find(r => r.toLowerCase() == role.toLowerCase());
    if (found === undefined) {
        throw new C.InvError(_.sprintf(C.ERROR_INVALID_ROLE, role));
    }
    role = roles[found];
    let as = _.annotations(role.file);
    let method = command.join(':');
    if (!method) {
        let msg = [];
        let pad = Math.max(...Object.keys(as).map(k => k.length));
        let pattern = ` > ${role.name}:%s`;
        let plen = pattern.length - 2;
        for (let k of Object.keys(as)) {
            let d = as[k].description;
            let str = _.sprintf(pattern, k);
            str += d ? ' '.repeat(pad + plen - str.length + 4) + d : '';
            msg.push(str);
        }
        msg = role.name + (msg.length ? ('\n' + msg.join('\n')) : '');
        throw new C.InvError(_.sprintf(C.ERROR_NO_METHOD, msg));
    }
    found = Object.keys(as).find(m => {
        let alias = as[m].alias || '';
        return [m.toLowerCase(), alias.toLowerCase()].includes(method.toLowerCase());
    });
    if (found === undefined) {
        throw new C.InvError(_.sprintf(C.ERROR_INVALID_METHOD, method));
    }
    method = found;
    let objects;
    if (role.isSingleton) {
        objects = _.getObjectsFromInventory(inventory, role, '*');
        if (!objects.length) {
            throw new C.InvError(_.sprintf(C.ERROR_NO_SINGLETON_ROLE, role.name));
        }
        if (objects.length > 1) {
            let msg = _.sprintf(C.ERROR_JUST_ONE_SINGLETON_ROLE, Object.keys(objects).join(', '));
            throw new C.InvError(msg);
        }
    } else {
        let pattern = argv._.shift();
        if (pattern === undefined) {
            throw new C.InvError(C.ERROR_NO_PATTERN);
        }
        objects = _.getObjectsFromInventory(inventory, role, pattern);
    }
    await Promise.all(objects.map(async object => {
        let quiet = argv.q;
        let [err] = await _.to(object[method]({argv, inventory, quiet}));
        err && object.log('error!');
    }));
}

module.exports = {
    register,
    execute,
    InvError: C.InvError,
    roles,
};
