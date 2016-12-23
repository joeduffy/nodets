// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as assert from 'assert';
import * as net from 'net';

const DEFAULT_BACKOFF_DELAY = 2; // Default delay in milliseconds.
const DEFAULT_BACKOFF_MULTIPLIER = 2; // Default backoff multiplier.
const DEFAULT_BACKOFF_MAX_RETRIES = 15; // Default maximum number of retries.

/**
 * This routine waits for a port on the given host, returning when it is available.  It uses a configurable backoff
 * strategy and throws an exception if the port doesn't become available within the expected period of time.
 */
export async function waitForPort(host: string, port: number, policy?: IBackoffPolicy,
                                  dbgout?: (line: string) => void): Promise<void> {
    assert(host);
    assert(port);

    // Use some default policies if not specified.
    policy = policy || {};
    policy.delay = policy.delay || DEFAULT_BACKOFF_DELAY;
    assert(policy.delay > 0);
    policy.multiplier = policy.multiplier || DEFAULT_BACKOFF_MULTIPLIER;
    assert(policy.multiplier > 0);
    policy.maxRetries = policy.maxRetries || DEFAULT_BACKOFF_MAX_RETRIES;
    assert(policy.maxRetries > 0);

    // Now go round and round until the server comes up, or we reach the max retries, whichever comes sooner.
    let success: boolean = false;
    let delay: number = policy.delay;
    let retry: number = 0;
    for (; retry < policy.maxRetries; retry++) {
        if (retry > 0 && dbgout) {
            dbgout(`libutils::net.waitForPort(${host}, ${port}) timed out; trying again with a ${delay}ms timeout`);
        }

        let done: boolean = false;
        success = await new Promise<boolean>((resolve, reject) => {
            // Attempt to connect asynchronously.
            let sock: net.Socket = net.createConnection(port, host, () => {
                done = true;
                resolve(true);
            });
            sock.on('error', (err: Error) => {
                if ((<any>err).code === 'ECONNREFUSED') {
                    // This is OK; we will retry after the timeout.
                }
                else {
                    // Unexpected error; propagate it to callers.
                    reject(err);
                }
            });

            // Set a timer that will cancel the socket after our delay has expired.
            setTimeout(
                () => {
                    sock.destroy();
                    if (!done) {
                        resolve(false);
                    }
                },
                delay
            );
        });
        if (success) {
            break;
        }

        // No go; up the delay and try again (so long as we didn't hit max retries).
        delay *= policy.multiplier;
    }

    if (success) {
        if (retry > 0 && dbgout) {
            dbgout(`libutils::net.waitForPort(${host}, ${port}) succeeded after ${retry} retries`);
        }
    }
    else {
        if (dbgout) {
            dbgout(`libutils::net.waitForPort(${host}, ${port}) reached max retries ${policy.maxRetries}, giving up`);
        }
        throw new Error(`Destination ${host}:${port} did not become reachable in the allotted amount of time`);
    }
}

/** A policy for configuring the wait backoff strategy. */
export interface IBackoffPolicy {
    delay?: number; // The starting delay in milliseconds.
    multiplier?: number; // The delay multiplier.
    maxRetries?: number; // The maximum number of times to retry.
}

