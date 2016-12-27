// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

export function extend<T, U>(t: T, u: U): T & U;
export function extend<T, U, V>(t: T, u: U, v: V): T & U & V;
export function extend<T, U, V, W>(t: T, u: U, v: V, w: W): T & U & V & W;
export function extend(...args: any[]): any {
    let res: any = {};
    Object.assign(res, ...args);
    return res;
}

export function maybeNull<T, U>(t: T | null, func: (t: T) => U): U | null {
    if (t === null) {
        return null;
    }
    return func(t);
}

export function maybeUndefined<T, U>(t: T | undefined, func: (t: T) => U): U | undefined {
    if (t === undefined) {
        return undefined;
    }
    return func(t);
}

export function maybeNund<T, U>(t: T | null | undefined, func: (t: T) => U): U | null | undefined {
    if (t === null) {
        return null;
    }
    else if (t === undefined) {
        return undefined;
    }
    return func(t);
}

