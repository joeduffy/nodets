// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as assert from 'assert';
import * as nodets from '../../src';
import * as url from 'url';

function assertEqualUrls(u1: url.Url, u2: url.Url, skipPathParts?: boolean): void {
    assert.strictEqual(u1.protocol, u2.protocol);
    assert.strictEqual(u1.slashes, u2.slashes);
    assert.strictEqual(u1.auth, u2.auth);
    assert.strictEqual(u1.host, u2.host);
    assert.strictEqual(u1.port, u2.port);
    assert.strictEqual(u1.hostname, u2.hostname);
    assert.strictEqual(u1.hash, u2.hash);
    assert.strictEqual(u1.search, u2.search);
    assert.strictEqual(u1.query, u2.query);
    if (!skipPathParts) {
        assert.strictEqual(u1.pathname, u2.pathname);
        assert.strictEqual(u1.path, u2.path);
        assert.strictEqual(u1.href, u2.href);
    }
}

describe('Url', function() {
    describe('#clone', function() {
        it('properly clones urls', function() {
            let u1 = url.parse('http://user:pass@localhost:4321/a/b/c?qsarg=qsvalue#anchor');
            let u1clone = nodets.web.Url.clone(u1);

            assertEqualUrls(u1, u1clone);

            // Make sure edits don't affect the original.
            let u1href = u1.href;
            u1clone.href = undefined;
            assert.strictEqual(u1.href, u1href);

            let u2 = url.parse('http://user:pass@localhost:4321?qsarg=qsvalue#anchor');
            let u2clone = nodets.web.Url.clone(u2);

            assertEqualUrls(u2, u2clone);

            // Make sure edits don't affect the original.
            let u2href = u2.href;
            u2clone.href = undefined;
            assert.strictEqual(u2.href, u2href);

            let u3 = url.parse('user:pass@localhost');
            let u3clone = nodets.web.Url.clone(u3);

            assertEqualUrls(u3, u3clone);

            // Make sure edits don't affect the original.
            let u3href = u3.href;
            u3clone.href = undefined;
            assert.strictEqual(u3.href, u3href);
        });
    });
    describe('#join', function() {
        it('properly appends to urls', function() {
            {
                let u: url.Url = <url.Url>{};
                let umod = nodets.web.Url.join(u, 'a');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a');
                assert.strictEqual(umod.path, '/a');
                assert.strictEqual(umod.href, '/a');
            }
            {
                let u = url.parse('href://user:pass@localhost');
                let umod = nodets.web.Url.join(u, 'a/b/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c');
                assert.strictEqual(umod.href, 'href://user:pass@localhost/a/b/c');
            }
            {
                let u = url.parse('href://user:pass@localhost');
                let umod = nodets.web.Url.join(u, 'a', 'b', 'c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c');
                assert.strictEqual(umod.href, 'href://user:pass@localhost/a/b/c');
            }
            {
                let u = url.parse('href://user:pass@localhost');
                let umod = nodets.web.Url.join(u, 'a/', '/b/', '/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c');
                assert.strictEqual(umod.href, 'href://user:pass@localhost/a/b/c');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321');
                let umod = nodets.web.Url.join(u, 'a/b/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/');
                let umod = nodets.web.Url.join(u, 'a/b/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'a/b/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'a/b/c');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c');
                assert.strictEqual(umod.path, '/a/b/c?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'd/e/f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'd', 'e', 'f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c/?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'd/e/f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c/?qsarg=qsvalue#anchor');
                let umod = nodets.web.Url.join(u, 'd', 'e', 'f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f?qsarg=qsvalue');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f?qsarg=qsvalue#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c#anchor');
                let umod = nodets.web.Url.join(u, 'd/e/f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f#anchor');
            }
            {
                let u = url.parse('http://user:pass@localhost:4321/a/b/c/#anchor');
                let umod = nodets.web.Url.join(u, 'd/e/f');
                assertEqualUrls(u, umod, true);
                assert.strictEqual(umod.pathname, '/a/b/c/d/e/f');
                assert.strictEqual(umod.path, '/a/b/c/d/e/f');
                assert.strictEqual(umod.href, 'http://user:pass@localhost:4321/a/b/c/d/e/f#anchor');
            }
            {
                let u = url.parse('http://localhost');
                let umod = nodets.web.Url.join(u, '/');
                assertEqualUrls(u, umod, false);
            }
        });
    });
});

