// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as process from "process";
import * as util from "util";

const failCode = -227;
const failMsg: string = "A failure has occurred";
const assertMsg: string = "An assertion failure has occurred";

export function fail(): never {
    return failfast(failMsg);
}

export function failf(msg: string, ...args: any[]): never {
    return failfast(`${failMsg}: ${util.format(msg, ...args)}`);
}

export function assert(b: boolean): void {
    if (!b) {
        return failfast(assertMsg);
    }
}

export function assertf(b: boolean, msg: string, ...args: any[]): void {
    if (!b) {
        return failfast(`${assertMsg}: ${util.format(msg, ...args)}`);
    }
}

function failfast(msg: string): never {
    Error.stackTraceLimit = 1000;
    console.error(new Error(msg).stack);
    process.exit(failCode);
    while (true) {} // this will never be reached, thanks to process.exit, but makes TSC happy.
}

