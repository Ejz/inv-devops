const minimist = require('minimist');
const fs = require('fs');

const _ = require('./helpers');
const C = require('./constants');

let rolesDir = C.ROOT + '/roles';

let registered = [];

let roles = {};

function register(smth) {
    if (_.isFunction(smth)) {
        let idx = registered.findIndex(r => r.name.toLowerCase() == smth.name.toLowerCase());
        if (~idx) {
            registered[idx] = smth;
        } else {
            registered.push(smth);
        }
    } else if (_.isDirectory(smth)) {
        fs.readdirSync(smth).forEach(f => {
            f = [smth, f].join('/');
            if (_.isFile(f)) {
                register(require(f));
            }
        });
    }
}

register(rolesDir);

fs.readdirSync(rolesDir).forEach(f => {
    roles[f.replace('.js', '')] = require([rolesDir, f].join('/'));
});

async function execute(inventory, argv) {
    inventory = _.inventory(inventory, registered);
    argv = minimist(argv);
    let command = argv._.pop();
    if (command === undefined) {
        throw new C.InvError(C.ERROR_NO_ROLE);
    }
    command = command.split(':');
    if (command.length != 2) {
        throw new C.InvError(_.sprintf(C.ERROR_INVALID_ROLE, command.join(':')));
    }
    let found;
    let [role, method] = command;
    found = registered.find(r => r.name.toLowerCase() == role.toLowerCase());
    if (found === undefined) {
        throw new C.InvError(_.sprintf(C.ERROR_INVALID_ROLE, role));
    }
    role = found;
    let as = await _.annotations(role.file);
    found = Object.keys(as.methods).find(m => m.toLowerCase() == method.toLowerCase());
    if (found === undefined) {
        throw new C.InvError(_.sprintf(C.ERROR_INVALID_METHOD, method));
    }
    method = found;
    let objects;
    if (as.class.isStatic) {
        objects = _.getObjectsFromInventory(inventory, role, '*');
        if (!objects.length) {
            throw new C.InvError(_.sprintf(C.ERROR_NO_STATIC_ROLE, role.name));
        }
        if (objects.length > 1) {
            throw new C.InvError(_.sprintf(C.ERROR_JUST_ONE_STATIC_ROLE, Object.keys(objects).join(', ')));
        }
    } else {
        let pattern = argv._.pop();
        if (pattern === undefined) {
            throw new C.InvError(C.ERROR_NO_PATTERN);
        }
        objects = _.getObjectsFromInventory(inventory, role, pattern);
    }
    objects.forEach(async object => {
        let requires = {};
        for (let r of (as.methods[method].requires || [])) {
            let {alias, role, pattern} = r;
            found = registered.find(r => r.name.toLowerCase() == role.toLowerCase());
            if (found === undefined) {
                throw '!';
            }
            role = found;
            requires[alias] = _.getObjectsFromInventory(inventory, role, pattern);
        }
        await _.to(object[method](requires, argv));
    });
}

module.exports = {
    register,
    roles,
    execute,
    InvError: C.InvError,
};
