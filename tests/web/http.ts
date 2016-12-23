// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as assert from 'assert';
import * as nodets from '../../src';
import * as url from 'url';
import * as util from '../util';

let express = require('express');
let bodyParser = require('body-parser');

// This is a helper method that wraps a callback with a transient web server.
async function withWebServer(
    setupCallback: (app: any) => number,
    requestCallback: () => Promise<void>): Promise<void> {

    // Let the callback register the intended routes, and return the desired port #.
    let app = express();
    let port = setupCallback(app);

    // Now listen, perform the request, and then tear down everything.
    let server = app.listen(port);
    await requestCallback();
    server.close();
}

describe('HTTP', () => {
    describe('#http success', () => {
        it('GETs simple JSON payloads', util.asyncTest(async () => {
            let json: any = {
                a: 'test',
                object: 54321
            };
            let jsonText: string = JSON.stringify(json);
            await withWebServer(
                app => {
                    app.get('/simple', (req: any, res: any) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(jsonText);
                    });
                    return 9321;
                },
                async () => {
                    let resp: nodets.web.HttpResponse = await nodets.web.http(
                        url.parse('http://localhost:9321/simple'), nodets.web.HttpMethod.GET);
                    assert(resp);
                    assert(resp.code === 200);
                    assert.strictEqual(resp.rawPayload, jsonText);
                    assert(resp.payload);
                    assert.strictEqual(resp.payload.a, json.a);
                    assert.strictEqual(resp.payload.object, json.object);
                }
            );
        }));

        it('GETs simple JSON payloads (string based "overload" + default GET)', util.asyncTest(async () => {
            let json: any = {
                a: 'test',
                object: 54321
            };
            let jsonText: string = JSON.stringify(json);
            await withWebServer(
                app => {
                    app.get('/simple', (req: any, res: any) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(jsonText);
                    });
                    return 9321;
                },
                async () => {
                    let resp: nodets.web.HttpResponse = await nodets.web.http('http://localhost:9321/simple');
                    assert(resp);
                    assert(resp.code === 200);
                    assert.strictEqual(resp.rawPayload, jsonText);
                    assert(resp.payload);
                    assert.strictEqual(resp.payload.a, json.a);
                    assert.strictEqual(resp.payload.object, json.object);
                }
            );
        }));

        it('POSTs simple JSON payloads', util.asyncTest(async () => {
            let json: any = {
                a: 'test',
                object: 54321
            };
            let jsonText: string = JSON.stringify(json);

            let serverError: string = '';
            await withWebServer(
                app => {
                    app.post('/simple', bodyParser.json(), (req: any, res: any) => {
                        if (!req.body) {
                            serverError = 'Request body empty';
                        }
                        else {
                            let body = JSON.stringify(req.body);
                            if (body !== jsonText) {
                                serverError = 'Request body was wrong: ' + body;
                            }
                        }                        
                        res.sendStatus(200);
                    });
                    return 9321;
                },
                async () => {
                    let resp: nodets.web.HttpResponse = await nodets.web.http(
                        url.parse('http://localhost:9321/simple'), nodets.web.HttpMethod.POST, json);
                    assert(resp);
                    assert(resp.code === 200);
                    assert.strictEqual(serverError, '');
                }
            );
        }));
    });

    describe('#http failures', () => {
        it('rejects bad endpoints with a failure', util.asyncTest(async () => {
            let caught = undefined;
            try {
                let _: nodets.web.HttpResponse = await nodets.web.http(
                    url.parse('http://localhost:9321/simple'), nodets.web.HttpMethod.GET);
                assert(false);
            }
            catch (err) {
                caught = err;
            }
            assert(caught);
        }));

        it('rejects HTTP errros with a resolved promise', util.asyncTest(async () => {
            await withWebServer(
                app => {
                    return 9321;
                },
                async () => {
                    let resp: nodets.web.HttpResponse = await nodets.web.http(
                        url.parse('http://localhost:9321/simple'), nodets.web.HttpMethod.GET);
                    assert(resp);
                    assert(resp.code === 404);
                }
            );
        }));
    });
});
