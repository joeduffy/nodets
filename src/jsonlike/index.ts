// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

/** A "JSON-like" map of strings to primitive values. */
export interface IJSONObject {
    [key: string]: JSONValue;
}

/** A "JSON-like" value: a primitive type, a map of strings to values, or an array. */
export type JSONValue =
    string | number | boolean | IJSONObject | IJSONArray | null;

/** A "JSON-like" array is simply an array of JSON-like values. */
export interface IJSONArray extends Array<JSONValue> { }

/** Produces a a deep clone that shares no memory with the original Environment. */
export function clone(obj: IJSONObject): IJSONObject {
    let newObj: IJSONObject = {};
    for (let key of Object.keys(obj)) {
        if (!key || typeof key !== "string") {
            throw new Error("Invalid non-string key in JSON-like object");
        }
        newObj[key] = cloneValue(obj[key]);
    }
    return newObj;
}

/** This function deep clones a JSON-like value, including primitives, arrays, and objects. */
export function cloneValue(val: JSONValue): JSONValue {
    if (val === null || typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        // Primitive types need no cloning.
        return val;
    }
    else if (val instanceof Array) {
        // Arrays need to have their elements cloned.
        let arr: IJSONArray = <IJSONArray><any>[];
        for (let i = 0; i < val.length; i++) {
            arr.push(cloneValue(val[i]));
        }
        return arr;
    }
    else {
        // Environments simply recurse into the cloneEnvironment routine.
        return clone(val);
    }
}

// Functions that query the type of an JSONValue.  This encapsulates messy type checking.

/** Checks whether the given JSONValue is an array. */
export function isArray(value: JSONValue): boolean {
    return (value instanceof Array);
}

/** Checks whether the given JSONValue is a boolean. */
export function isBoolean(value: JSONValue): boolean {
    return (typeof value === "boolean");
}

/** Checks whether the given JSONValue is a map. */
export function isMap(value: JSONValue): boolean {
    return !isArray(value) && !isBoolean(value) &&
        !isNumber(value) && !isString(value);
}

/** Checks whether the given JSONValue is a number. */
export function isNumber(value: JSONValue): boolean {
    return (typeof value === "number");
}

/** Checks whether the given JSONValue is a string. */
export function isString(value: JSONValue): boolean {
    return (typeof value === "string");
}

// Functions that fetch an JSONValue as a particular type.  This encapsulates messy type casting.

/** Converts the given JSONValue to an array, throwing if it's of the wrong type. */
export function asArray(value: JSONValue | undefined): IJSONArray | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (isArray(value)) {
        return <IJSONArray>value;
    }
    throw new Error(`Configuration value is not an array (${typeof value})`);
}

/** Converts the given JSONValue to a boolean, throwing if it's of the wrong type. */
export function asBoolean(value: JSONValue | undefined): boolean | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (isBoolean(value)) {
        return <boolean>value;
    }
    throw new Error(`Configuration value is not a boolean (${typeof value})`);
}

/** Converts the given JSONValue to a map, throwing if it's of the wrong type. */
export function asMap(value: JSONValue | undefined): IJSONObject | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (isMap(value)) {
        return <IJSONObject>value;
    }
    throw new Error(`Configuration value is not a map (${typeof value})`);
}

/** Converts the given JSONValue to a number, throwing if it's of the wrong type. */
export function asNumber(value: JSONValue | undefined): number | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (isNumber(value)) {
        return <number>value;
    }
    throw new Error(`Configuration value is not a number (${typeof value})`);
}

/** Converts the given JSONValue to a string, throwing if it's of the wrong type. */
export function asString(value: JSONValue | undefined): string | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (isString(value)) {
        return <string>value;
    }
    throw new Error(`Configuration value is not a string (${typeof value})`);
}

// These functions fetch an JSONValue as a given type from an IJSONObject directly.

/** Fetches the given key from the map. */
export function get(obj: IJSONObject, key: string): JSONValue | null | undefined {
    if (!obj) {
        throw new Error("An object is required");
    }
    if (!key) {
        throw new Error("A non-empty key is required");
    }

    // Keys are allowed to be "compound" (that is, with slashes); do the lookup accordingly.
    let fullKey: string = key;
    while (true) {
        let keySlash: number = key.indexOf("/");
        if (keySlash === -1) {
            return obj[key];
        }
        else {
            let keyPart: string = key.substring(0, keySlash);
            let val: JSONValue = obj[keyPart];
            if (!val) {
                return val;
            }
            if (!isMap(val)) {
                throw new Error(`Compound key "${fullKey}" could not be loaded, because "${keyPart}" is not a map`);
            }
            obj = <IJSONObject>val;
            key = key.substring(keySlash+1);
        }
    }
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequired(obj: IJSONObject, key: string): JSONValue {
    let result: JSONValue | undefined = get(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    return result;
}

/** Fetches the given key from the map, as an array, throwing if it's of the wrong type. */
export function getArray(obj: IJSONObject, key: string): IJSONArray | null | undefined {
    let value: JSONValue | undefined = get(obj, key);
    if (value === null || value === undefined) {
        return value;
    }
    if (isArray(value)) {
        return <IJSONArray>value;
    }
    throw new Error(`Configuration value for ${key} exists, but is not an array (${typeof value})`);
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequiredArray(obj: IJSONObject, key: string): IJSONArray {
    let result: IJSONArray | null | undefined = getArray(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    if (result === null) {
        throw new Error(`Key "${key}" exists, but it is null`);
    }
    return result;
}

/** Fetches the given key from the map, as a boolean, throwing if it's of the wrong type. */
export function getBoolean(obj: IJSONObject, key: string): boolean | null | undefined {
    let value: JSONValue | undefined = get(obj, key);
    if (value === null || value === undefined) {
        return value;
    }
    if (isBoolean(value)) {
        return <boolean>value;
    }
    throw new Error(`Configuration value for ${key} exists, but is not a boolean (${typeof value})`);
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequiredBoolean(obj: IJSONObject, key: string): boolean {
    let result: boolean | null | undefined = getBoolean(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    if (result === null) {
        throw new Error(`Key "${key}" exists, but it is null`);
    }
    return result;
}

/** Fetches the given key from the map, as a map, throwing if it's of the wrong type. */
export function getMap(obj: IJSONObject, key: string): IJSONObject | null | undefined {
    let value: JSONValue | undefined = get(obj, key);
    if (value === null || value === undefined) {
        return value;
    }
    if (isMap(value)) {
        return <IJSONObject>value;
    }
    throw new Error(`Configuration value for ${key} exists, but is not a map (${typeof value})`);
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequiredMap(obj: IJSONObject, key: string): IJSONObject {
    let result: IJSONObject | null | undefined = getMap(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    if (result === null) {
        throw new Error(`Key "${key}" exists, but it is null`);
    }
    return result;
}

/** Fetches the given key from the map, as a number, throwing if it's of the wrong type. */
export function getNumber(obj: IJSONObject, key: string): number | null | undefined {
    let value: JSONValue | undefined = get(obj, key);
    if (value === null || value === undefined) {
        return value;
    }
    if (isNumber(value)) {
        return <number>value;
    }
    throw new Error(`Configuration value for ${key} exists, but is not a number (${typeof value})`);
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequiredNumber(obj: IJSONObject, key: string): number {
    let result: number | null | undefined = getNumber(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    if (result === null) {
        throw new Error(`Key "${key}" exists, but it is null`);
    }
    return result;
}

/** Fetches the given key from the map, as a string, throwing if it's of the wrong type. */
export function getString(obj: IJSONObject, key: string): string | null | undefined {
    let value: JSONValue | undefined = get(obj, key);
    if (value === null || value === undefined) {
        return value;
    }
    if (isString(value)) {
        return <string>value;
    }
    throw new Error(`Configuration value for ${key} exists, but is not a string (${typeof value})`);
}

/** Fetches the given key from the map, and ensures it exists. */
export function getRequiredString(obj: IJSONObject, key: string): string {
    let result: string | null | undefined = getString(obj, key);
    if (result === undefined) {
        throw new Error(`Key "${key}" is missing from the object`);
    }
    if (result === null) {
        throw new Error(`Key "${key}" exists, but it is null`);
    }
    return result;
}

/** Sets the given key in the map. */
export function set(obj: IJSONObject, key: string, value: JSONValue | undefined): void {
    if (!obj) {
        throw new Error("An object is required");
    }
    if (!key) {
        throw new Error("A non-empty key is required");
    }

    // Keys are allowed to be "compound" (that is, with slashes); do the lookup accordingly.
    let fullKey: string = key;
    while (true) {
        let keySlash: number = key.indexOf("/");
        if (keySlash === -1) {
            if (value === undefined) {
                delete obj[key];
            }
            else {
                obj[key] = value;
            }
            break;
        }
        else {
            let keyPart: string = key.substring(0, keySlash);
            let val: JSONValue = obj[keyPart];
            if (!val) {
                obj = obj[keyPart] = {};
            }
            else if (!isMap(val)) {
                throw new Error(`Compound key "${fullKey}" could not be loaded, because "${keyPart}" is not a map`);
            }
            else {
                obj = <IJSONObject>val;
            }
            key = key.substring(keySlash+1);
        }
    }
}

/**
 * This function conveniently converts any JavaScript object to an IJSONObject, doing the appropriate checking
 * along the way to ensure all properties are valid.  It simply reuses the above cloning functions, as they do
 * the right checking.
 */
export function toJSONLike(obj: any): IJSONObject {
    return clone(<IJSONObject>obj);
}

