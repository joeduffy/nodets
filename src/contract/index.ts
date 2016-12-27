// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as process from "process";
import * as util from "util";

const failCode = -227;
const failMsg: string = "A failure has occurred";
const assertMsg: string = "An assertion failure has occurred";

export function fail(): never {
    return failf(failMsg);
}

export function failf(msg: string, ...args: any[]): never {
    let msgf: string = util.format(msg, ...args);
    console.error(msgf);
    console.error(new Error().stack);
    process.exit(failCode);
    throw new Error(msgf); // this will never be reached, due to the os.exit, but makes TSC happy.
}

export function assert(b: boolean): void {
    if (!b) {
        failf(assertMsg);
    }
}

export function assertf(b: boolean, msg: string, ...args: any[]): void {
    if (!b) {
        failf(assertMsg, ...args);
    }
}

