// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

// Sleeps for the given number of seconds and then resolves the promise.
export function sleep(seconds: number): Promise<void> {
    return usleep(1000 * seconds);
}

// Sleeps for the given number of milliseconds and then resolves the promise.
export function usleep(milliseconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
}

