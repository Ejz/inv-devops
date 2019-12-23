const fs = require('fs');
const path = require('path');
const util = require('util');
const Mustache = require('mustache');
const cloneDeep = require('lodash.clonedeep');

RegExp.escape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

Mustache.escape = t => t;

function isString(f) {
    return typeof f === 'string';
}

function isFunction(f) {
    return typeof f === 'function';
}

const isArray = Array.isArray;

function isObject(o) {
    return (!!o) && (o.constructor === Object);
}

function isDirectory(dir) {
    try {
        return fs.lstatSync(dir).isDirectory();
    } catch (e) {
        return false;
    }
}

function isFile(file) {
    try {
        return fs.lstatSync(file).isFile();
    } catch (e) {
        return false;
    }
}

const sprintf = util.format;

function to(p) {
    p = p.then ? p : Promise.resolve(p);
    return p.then(data => [null, data]).catch(err => [err, null]);
}

function inherits(B, A) {
    let b = isFunction(B) ? new B('', {}) : B;
    while (B && Object.getPrototypeOf(b) && A && A.prototype) {
        if (Object.getPrototypeOf(b) === A.prototype) {
            return true;
        }
        b = Object.getPrototypeOf(b);
    }
    return false;
}

function esc(s) {
    if (/^[a-zA-Z0-9_.\/-]+$/.test(s)) {
        return s;
    }
    return _esc([s]);
}

function nsplit(str) {
    return str.split(/\s*\n\s*/g).map(_ => _.trim()).filter(Boolean);
}

function mustache(smth, view) {
    if (smth === undefined || isFunction(smth)) {
        return smth;
    }
    if (isObject(smth)) {
        let keys = Object.keys(smth);
        for (let key of keys) {
            smth[key] = mustache(smth[key], view);
        }
        return smth;
    }
    if (isArray(smth)) {
        return smth.map(s => mustache(s, view));
    }
    return Mustache.render(String(smth), view);
}

function _mustachify_merge(a, b) {
    if (isObject(a)) {
        let keys = isObject(b) ? Object.keys(a) : [];
        for (let key of keys) {
            a[key] = _mustachify_merge(a[key], b[key]);
        }
        return a;
    }
    if (isArray(a)) {
        let len = isArray(b) ? a.length : 0;
        for (let i = 0; i < len; i++) {
            a[i] = _mustachify_merge(a[i], b[i]);
        }
        return a;
    }
    return b !== undefined ? b : a;
}

function _mustachify_vars(str) {
    if (str === undefined || isFunction(str)) {
        return [];
    }
    return Mustache.parse(str + '').filter(([t]) => t != 'text').map(([, v]) => v);
}

function _mustachify_get_view(object) {
    let keys = Object.keys(object);
    let collect = {};
    for (let key of keys) {
        let value = object[key];
        if (isObject(value)) {
            value = _mustachify_get_view(value);
            collect[key] = value;
        } else if (isArray(value)) {
            value = value.map(v => _mustachify_vars(v).length ? undefined : v);
            collect[key] = value;
        } else if (!_mustachify_vars(value).length) {
            collect[key] = value;
        }
    }
    return collect;
}

function _mustachify_filter(smth, view, validate = false) {
    if (isObject(smth)) {
        let keys = Object.keys(smth);
        let collect = {};
        for (let key of keys) {
            collect[key] = _mustachify_filter(smth[key], view, validate);
        }
        return collect;
    }
    if (isArray(smth)) {
        return smth.map(v => _mustachify_filter(v, view, validate));
    }
    let vars = _mustachify_vars(smth);
    let filter = v => _mustachify_in(v, view);
    if (validate && vars.length) {
        throw vars;
    }
    return (vars.length && !vars.filter(filter).length) ? smth : undefined;
}

function _mustachify_in(v, view) {
    v = v.split('.');
    let cursor = view;
    do {
        cursor = cursor[v.shift()];
    } while (v.length && cursor !== undefined);
    return cursor === undefined;
}

function mustachify(object) {
    let backup;
    do {
        backup = JSON.stringify(object);
        let view = _mustachify_get_view(object);
        let filtered = _mustachify_filter(object, view);
        filtered = mustache(filtered, view);
        object = _mustachify_merge(object, filtered);
    } while (JSON.stringify(object) !== backup);
    _mustachify_filter(object, {}, true);
    return object;
}

function inventory(inv, roles) {
    Object.keys(inv).forEach(k => {
        let v = cloneDeep(inv[k]);
        v = isArray(v) ? v : [v];
        v = v.reduce((a, c) => extend(a, c), {});
        let name = role => isFunction(role) ? role.name : role;
        let names = roles.map(name);
        v.roles = (v.roles || []).filter(role => names.includes(name(role)));
        for (let role of v.roles.slice(0)) {
            v.roles = v.roles.concat(roles.filter(r => inherits(role, r)));
        }
        v.roles = v.roles.filter((v, i, a) => a.indexOf(v) == i);
        inv[k] = mustachify(v);
    });
    return inv;
}

function matchAll(regex, string) {
    let idx = regex.lastIndex;
    regex.lastIndex = 0;
    let t, collect = [];
    while (t = regex.exec(string)) {
        collect.push(t);
    }
    regex.lastIndex = idx;
    return collect;
}

function annotations(file) {
    let content = isFile(file) ? String(fs.readFileSync(file)) : file;
    let regex1 = /\/\*\*([\s\S]*?)\*\/\s*\n\s*([\s\S]*?)\n/g;
    let regex2 = /(async\s+)?(\S+)\(/i;
    let regex3 = /@(\S+)([^\n]+(.*?))?\n/g;
    let t;
    let collect = {};
    for (let [, block, code] of matchAll(regex1, content)) {
        let m = code.match(regex2) || [];
        if (!m.length) {
            continue;
        }
        let vars = {};
        for (let [, key, value] of matchAll(regex3, block)) {
            value = value === undefined ? true : value.trim();
            vars[key] = value; 
        }
        if (vars.public) {
            delete vars.public;
            collect[m[2]] = vars;
        }
    }
    return collect;
}

function getObjectsFromInventory(inv, role, pattern) {
    pattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
    let objects = [];
    let entries = Object.entries(inv);
    entries = entries.filter(([k, v]) => pattern.test(k) && v.roles.includes(role));
    for (let [k, v] of entries) {
        objects.push(new role(k, cloneDeep(v)));
    }
    return objects;
}

function readFile(file) {
    return isFile(file) ? String(fs.readFileSync(file)) : '';
}

function writeFile(file, content) {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
}

function rand(min = 0, max = Number.MAX_SAFE_INTEGER) {
    min = Number(min);
    max = Number(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extend(a, b) {
    if (isObject(a) && isObject(b)) {
        let c = {};
        let keys = Object.keys(a).concat(Object.keys(b));
        keys = keys.filter((v, i, a) => a.indexOf(v) == i);
        for (let key of keys) {
            c[key] = extend(a[key], b[key]);
        }
        return c;
    }
    if (isArray(a) && isArray(b)) {
        return a.concat(b);
    }
    return b === undefined ? a : b;
}

module.exports = {
    isString,
    isFunction,
    isArray,
    isObject,
    isDirectory,
    isFile,
    sprintf,
    inherits,
    to,
    esc,
    nsplit,
    mustache,
    mustachify,
    inventory,
    matchAll,
    annotations,
    getObjectsFromInventory,
    readFile,
    writeFile,
    rand,
    extend,
}
