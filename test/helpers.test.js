const _ = require('../helpers');

test('nsplit', () => {
    let str = _.nsplit('\n asd1 \n asd2  \n \n asd3 ');
    expect(str).toStrictEqual(['asd1', 'asd2', 'asd3']);
});

test('isObject', () => {
    expect(_.isObject({})).toBe(true);
    expect(_.isObject(null)).toBe(false);
    expect(_.isObject(undefined)).toBe(false);
});

test('mustache', () => {
    let res;
    //
    res = _.mustache('hello {{world}}', {world: 'world'});
    expect(res).toStrictEqual('hello world');
    //
    res = _.mustache('{{foo}} ! {{ bar }}', {});
    expect(res).toStrictEqual(' ! ');
    //
    res = _.mustache('{{test}}', {test: '<&>'});
    expect(res).toStrictEqual('<&>');
    //
    res = _.mustache(['{{a}} {{b}}', '{{c}}'], {a: 1, b: 2, c: 3});
    expect(res).toStrictEqual(['1 2', '3']);
    //
    res = _.mustache(['{{a}} {{b}}', '{{c.d}} {{x.y.z}}'], {a: 1, b: 2, c: {d: 3}});
    expect(res).toStrictEqual(['1 2', '3 ']);
    //
    res = _.mustache({t: ['{{a}}'], tt: {ttt: '{{b}}'}, tttt: '{{c}}'}, {a: 1, b: 2, c: 3});
    expect(res).toStrictEqual({t: ['1'], tt: {ttt: '2'}, tttt: '3'});
    //
    res = _.mustache('{{0}}', ['hi']);
    expect(res).toStrictEqual('hi');
    //
    res = _.mustache('{{0.0}}', [['hi']]);
    expect(res).toStrictEqual('hi');
    //
    res = _.mustache('{{a.0}}', {a: ['hi']});
    expect(res).toStrictEqual('hi');
});

test('inventory', () => {
    let inv;
    //
    inv = _.inventory({k: {type: 't'}}, []);
    expect(inv.k.roles).toStrictEqual([]);
    //
    inv = _.inventory({k: [
        {roles: ['r1']},
        {type: 't1', roles: ['r1', 'r2']},
        {type: 't2', roles: ['r3', 'r4']},
    ]}, ['r1', 'r2', 'r3']);
    expect(inv.k.type).toStrictEqual('t2');
    expect(inv.k.roles).toStrictEqual(['r1', 'r2', 'r3']);
    //
    inv = _.inventory({k: {
        b: '{{c}}',
        a: '{{b}}',
        c: 1,
    }}, []);
    expect(inv.k.a).toStrictEqual('1');
    expect(inv.k.b).toStrictEqual('1');
    //
    let tpl = {
        inner: {
            http: 'http://{{domain}}',
        },
    };
    inv = _.inventory({
        a: [
            tpl,
            {domain: 'sitea.com'},
        ],
        k: [
            tpl,
            {domain: 'siteb.com'},
        ],
    }, []);
    expect(inv.k.inner.http).toStrictEqual('http://siteb.com');
});

test('inherits', () => {
    class A {}
    class B {}
    class C extends B {}
    class D extends C {}
    expect(_.inherits()).toStrictEqual(false);
    expect(_.inherits(A, B)).toStrictEqual(false);
    expect(_.inherits(B, A)).toStrictEqual(false);
    expect(_.inherits(C, B)).toStrictEqual(true);
    expect(_.inherits(D, B)).toStrictEqual(true);
});

test('mustachify', () => {
    let res;
    //
    res = _.mustachify({a: '{{b}}', b: '{{c}}', c: '1'});
    expect(res).toStrictEqual({a: '1', b: '1', c: '1'});
    //
    res = _.mustachify({a: ['{{b}}', '{{c}}'], b: '{{c}}', c: '1'});
    expect(res).toStrictEqual({a: ['1', '1'], b: '1', c: '1'});
    //
    res = _.mustachify({a: '{{b}} {{c}} {{d}}', b: '{{c}} {{d}}', c: '{{d}}', d: '1'});
    expect(res).toStrictEqual({a: '1 1 1 1', b: '1 1', c: '1', d: '1'});
    //
    res = _.mustachify({a: ['a1 {{c}}', 'a2 {{b}}'], b: 'b {{c}}', c: '0'});
    expect(res).toStrictEqual({a: ['a1 0', 'a2 b 0'], b: 'b 0', c: '0'});
    //
    res = _.mustachify({a: '{{b.0}} {{b.1}}', b: ['1', '{{c}}'], c: '2'});
    expect(res).toStrictEqual({a: '1 2', b: ['1', '2'], c: '2'});
});

test('annotations', () => {
    let as;
    as = _.annotations(`
        /**
         * @public
         * @alias write_ssh_config
         * @description Writes servers to your .ssh/config, use --servers [pattern]
         */
        async myMethod()
    `);
    expect(as).toStrictEqual({
        myMethod: {
            alias: 'write_ssh_config',
            description: 'Writes servers to your .ssh/config, use --servers [pattern]',
        },
    });
});
