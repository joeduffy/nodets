// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as assert from 'assert';
import * as jsonlike from '../src/jsonlike';

describe('EnvironmentUtils', () => {
    describe('#get*', () => {
        it('correctly looks up simple keys', () => {
            let map: jsonlike.IJSONObject = {};
            let keyArray: jsonlike.JSONValue[] = [ 'x', 42 ];
            let keyBoolean: boolean = true;
            let keyMap: jsonlike.IJSONObject = {};
            let keyNumber: number = 42;
            let keyString: string = 'testValue';
            map['keyArray'] = keyArray;
            map['keyBoolean'] = keyBoolean;
            map['keyMap'] = keyMap;
            map['keyNumber'] = keyNumber;
            map['keyString'] = keyString;

            assert.strictEqual(keyArray, jsonlike.getArray(map, 'keyArray'));
            assert.strictEqual(keyBoolean, jsonlike.getBoolean(map, 'keyBoolean'));
            assert.strictEqual(keyMap, jsonlike.getMap(map, 'keyMap'));
            assert.strictEqual(keyNumber, jsonlike.getNumber(map, 'keyNumber'));
            assert.strictEqual(keyString, jsonlike.getString(map, 'keyString'));
        });

        it('correctly looks up compound keys', () => {
            let map: jsonlike.IJSONObject = {};
            let keyMap: jsonlike.IJSONObject = {};
            map['keyMap'] = keyMap;
            keyMap['a'] = {};
            jsonlike.getRequiredMap(keyMap, 'a')['b'] = {};
            jsonlike.getRequiredMap(keyMap, 'a')['keyNumber'] = 42;
            jsonlike.getRequiredMap(
                jsonlike.getRequiredMap(keyMap, 'a'), 'b')['keyString'] = 'testValue';

            assert.strictEqual(42, jsonlike.getNumber(map, 'keyMap/a/keyNumber'));
            assert.strictEqual('testValue', jsonlike.getString(map, 'keyMap/a/b/keyString'));
        });
    });

    describe('#set*', () => {
        it('correctly sets/roundtrips compound keys', () => {
            let map: jsonlike.IJSONObject = {};
            jsonlike.set(map, 'keyMap/a/keyNumber', 42);
            assert.strictEqual(42, jsonlike.getNumber(map, 'keyMap/a/keyNumber'));
        });
    });

    describe('#as*', () => {
        it('casts values correctly', () => {
            let map: jsonlike.IJSONObject = {
                'array': [ 0, 1, 2 ],
                'boolean': true,
                'map': <jsonlike.IJSONObject>{},
                'number': 42,
                'string': 's'
            };

            // Properly convert actual values:
            let asArray: jsonlike.IJSONArray | null | undefined =
                jsonlike.asArray(jsonlike.getRequired(map, 'array'));
            assert.strictEqual(asArray, map['array']);
            let asBoolean: boolean | null | undefined =
                jsonlike.asBoolean(jsonlike.getRequired(map, 'boolean'));
            assert.strictEqual(asBoolean, map['boolean']);
            let asMap: jsonlike.IJSONObject | null | undefined =
                jsonlike.asMap(jsonlike.getRequired(map, 'map'));
            assert.strictEqual(asMap, map['map']);
            let asNumber: number | null | undefined =
                jsonlike.asNumber(jsonlike.getRequired(map, 'number'));
            assert.strictEqual(asNumber, map['number']);
            let asString: string | null | undefined =
                jsonlike.asString(jsonlike.getRequired(map, 'string'));
            assert.strictEqual(asString, map['string']);

            // Permit null and undefined values to flow through:
            assert.strictEqual(jsonlike.asArray(null), null);
            assert.strictEqual(jsonlike.asBoolean(null), null);
            assert.strictEqual(jsonlike.asMap(null), null);
            assert.strictEqual(jsonlike.asNumber(null), null);
            assert.strictEqual(jsonlike.asString(null), null);
            assert.strictEqual(jsonlike.asArray(undefined), undefined);
            assert.strictEqual(jsonlike.asBoolean(undefined), undefined);
            assert.strictEqual(jsonlike.asMap(undefined), undefined);
            assert.strictEqual(jsonlike.asNumber(undefined), undefined);
            assert.strictEqual(jsonlike.asString(undefined), undefined);
        });
    });
});

