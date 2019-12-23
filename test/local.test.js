const inv = require('..');
const C = require('../constants');
const _ = require('../helpers');

let {Local, Server} = inv.roles;

let inventory = {
    local: {
        roles: [Local],
        local: {
            home: C.TMPDIR,
            ssh_config: '/.ssh/config',
        },
    },
    myserver: {
        roles: [Server],
        server: {
            host: 'server' + _.rand(),
        },
    },
};

test('Local:write_ssh_config', async () => {
    let file = inventory.local.local.home + inventory.local.local.ssh_config;
    await inv.execute(inventory, ['Local:write_ssh_config', '-q', '--servers', '*']);
    let ex = inventory.myserver.server.host;
    let ne = 'server' + _.rand();
    inventory.myserver.server.host = ne;
    await inv.execute(inventory, ['Local:write_ssh_config', '-q', '--servers', '*']);
    expect(!!~_.readFile(file).indexOf(ex)).toBe(false);
    expect(!!~_.readFile(file).indexOf(ne)).toBe(true);
});
