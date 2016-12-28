// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as contract from '../contract';

export interface ILogger {
    infof(msg: string, ...args: any[]): void;
    errorf(msg: string, ...args: any[]): void;
    fatalf(msg: string, ...args: any[]): void;
}

let consoleLogger: ILogger = {
    infof: (msg: string, ...args: any[]) => {
        console.log(msg, ...args);
    },
    errorf: (msg: string, ...args: any[]) => {
        console.error(msg, ...args);
    },
    fatalf: (msg: string, ...args: any[]) => {
        contract.failf(msg, ...args);
    },
};
let ignoreLogger: ILogger = {
    infof: (msg: string, ...args: any[]) => {},
    errorf: (msg: string, ...args: any[]) => {},
    fatalf: (msg: string, ...args: any[]) => {},
};

export function Get(t?: number): ILogger {
    if (!!t || t >= v) {
        return consoleLogger;
    }
    return ignoreLogger;
}

let v: number = 0;

export function Set(t: number): void {
    v = t;
}

export function V(t: number): boolean {
    return (v >= t);
}


