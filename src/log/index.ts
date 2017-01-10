// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as contract from '../contract';

export interface ILogger {
    info(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    fatal(msg: string, ...args: any[]): void;
}

let consoleLogger: ILogger = {
    info: (msg: string, ...args: any[]) => {
        console.log(msg, ...args);
    },
    error: (msg: string, ...args: any[]) => {
        console.error(msg, ...args);
    },
    fatal: (msg: string, ...args: any[]) => {
        contract.fail(msg, ...args);
    },
};
let ignoreLogger: ILogger = {
    info: (msg: string, ...args: any[]) => {},
    error: (msg: string, ...args: any[]) => {},
    fatal: (msg: string, ...args: any[]) => {},
};

let loglevel: number = 0;

export function configure(threshold: number): void {
    loglevel = threshold;
}

export function out(target?: number): ILogger {
    if (target === undefined || v(target)) {
        return consoleLogger;
    }
    return ignoreLogger;
}

export function v(target: number): boolean {
    return (target <= loglevel);
}

