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

