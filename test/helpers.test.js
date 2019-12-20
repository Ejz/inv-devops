const _ = require('../helpers');

const eq = (a, b) => expect(b).toStrictEqual(b);

test('nsplit', () => {
    let str = _.nsplit('\n asd1 \n asd2  \n \n asd3 ');
    eq(str, ['asd1', 'asd2', 'asd3']);
});

test('mustache', () => {
    let res;
    //
    res = _.mustache('hello {{world}}', {world: 'world'});
    eq(res, 'hello world');
    //
    res = _.mustache('{{foo}} ! {{ bar }}', {});
    eq(res, ' ! ');
    //
    res = _.mustache('{{test}}', {test: '<&>'});
    eq(res, '<&>');
    //
    res = _.mustache(['{{a}} {{b}}', '{{c}}'], {a: 1, b: 2, c: 3});
    eq(res, ['1 2', '3']);
    //
    res = _.mustache(['{{a}} {{b}}', '{{c.d}} {{x.y.z}}'], {a: 1, b: 2, c: {d: 3}});
    eq(res, ['1 2', '3 ']);
    //
    res = _.mustache({t: ['{{a}}'], tt: {ttt: '{{b}}'}, tttt: '{{c}}'}, {a: 1, b: 2, c: 3});
    eq(res, {t: ['1'], tt: {ttt: '2'}, tttt: '3'});
    //
    res = _.mustache('{{0}}', ['hi']);
    eq(res, 'hi');
    //
    res = _.mustache('{{0.0}}', [['hi']]);
    eq(res, 'hi');
    //
    res = _.mustache('{{a.0}}', {a: ['hi']});
    eq(res, 'hi');
});

test('inventory', () => {
    let inv;
    //
    inv = _.inventory({k: {type: 't'}}, []);
    eq(inv.k.roles, []);
    //
    inv = _.inventory({k: [
        {roles: ['r1']},
        {type: 't1', roles: ['r1', 'r2']},
        {type: 't2', roles: ['r3', 'r4']},
    ]}, ['r1', 'r2', 'r3']);
    eq(inv.k.type, 't2');
    eq(inv.k.roles, ['r1', 'r2', 'r3']);
    //
    inv = _.inventory({k: {
        b: '{{c}}',
        a: '{{b}}',
        c: 1,
    }}, []);
    eq(inv.k.a, '1');
    eq(inv.k.b, '1');
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
    eq(inv.k.inner.http, 'http://siteb.com');
});

test('inherits', () => {
    class A {}
    class B {}
    class C extends B {}
    class D extends C {}
    eq(_.inherits(), false);
    eq(_.inherits(A, B), false);
    eq(_.inherits(B, A), false);
    eq(_.inherits(D, B), true);
});

test('mustachify', () => {
    let res;
    //
    res = _.mustachify({a: '{{b}}', b: '{{c}}', c: '1'});
    eq(res, {a: '1', b: '1', c: '1'});
    //
    res = _.mustachify({a: ['{{b}}', '{{c}}'], b: '{{c}}', c: '1'});
    eq(res, {a: ['1', '1'], b: '1', c: '1'});
    //
    res = _.mustachify({a: '{{b}} {{c}} {{d}}', b: '{{c}} {{d}}', c: '{{d}}', d: '1'});
    eq(res, {a: '1 1 1 1', b: '1 1', c: '1', d: '1'});
    //
    res = _.mustachify({a: ['a1 {{c}}', 'a2 {{b}}'], b: 'b {{c}}', c: '0'});
    eq(res, {a: ['a1 0', 'a2 b 0'], b: 'b 0', c: '0'});
    //
    res = _.mustachify({a: '{{b.0}} {{b.1}}', b: ['1', '{{c}}'], c: '2'});
    eq(res, {a: '1 2', b: ['1', '2'], c: '2'});
});
