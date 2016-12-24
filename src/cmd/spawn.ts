// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as childProcess from "child_process";

/** Executes a command and returns a handle to the process plus a promise for its completion. */
export function spawn(command: string, args?: string[], opts?: ISpawnOptions,
                      stdoutCb?: (line: string) => void, stderrCb?: (line: string) => void,
                      dbgoutCb?: (line: string) => void): ISpawnProcess {
    // Propagate options to the spawn command.
    let spawnOpts: any = {};
    if (opts && opts.cwd !== undefined) {
        spawnOpts.cwd = opts.cwd;
    }
    if (opts && opts.env !== undefined && opts.env !== null) {
        spawnOpts.env = opts.env;

        // By default, propagate any environment variables that weren't overridden.
        for (let e in process.env) {
            if (spawnOpts.env[e] === undefined) {
                spawnOpts.env[e] = process.env[e];
            }
        }
    }
    if (opts && opts.encoding !== undefined) {
        spawnOpts.encoding = opts.encoding;
    }
    if (opts && opts.shell !== undefined) {
        spawnOpts.shell = opts.shell;
    }

    // Spawn the child process to execute the command:
    if (dbgoutCb) {
        dbgoutCb(`Spawn command: ${command}:`);
        dbgoutCb(`\tArgs : ${JSON.stringify(args)}`);
        dbgoutCb(`\tOpts : ${JSON.stringify(opts)}`);
        dbgoutCb(`\tSpawn: ${JSON.stringify(spawnOpts)}`);
    }

    let handle: childProcess.ChildProcess = childProcess.spawn(command, args, spawnOpts);

    // Immediately terminate stdin, to signal an error if blocking stdin is used.
    handle.stdin.end();

    // Hook the stdout stream, if appropriate.
    let stdoutLines: string[] = [];
    let stdoutBuffer: string = "";
    handle.stdout.on("data", (data: any) => {
        stdoutBuffer += data;
        let newLineIndex: number;
        while ((newLineIndex = stdoutBuffer.indexOf("\n")) !== -1) {
            let line: string = stdoutBuffer.substring(0, newLineIndex);
            if (opts && opts.captureStdout) {
                stdoutLines.push(line);
                if (dbgoutCb) {
                    dbgoutCb(`stdout: [${command}]: ${line}`);
                }
            }
            else if (!stdoutCb) {
                console.log(line);
            }
            if (stdoutCb) {
                stdoutCb(line);
            }
            stdoutBuffer = stdoutBuffer.substring(newLineIndex + 1);
        }
    });

    // Hook the stderr stream.  We do this even if the caller didn't ask us to, so we can provide better error
    // messages should the command fail.
    let stderrLines: string[] = [];
    let stderrBuffer: string = "";
    let lastStderrLine: string;
    handle.stderr.on("data", (data: any) => {
        stderrBuffer += data;
        let newLineIndex: number;
        while ((newLineIndex = stderrBuffer.indexOf("\n")) !== -1) {
            let line: string = stderrBuffer.substring(0, newLineIndex);
            if (opts && opts.captureStderr) {
                stderrLines.push(line);
                if (dbgoutCb) {
                    dbgoutCb(`stderr: [${command}]: ${line}`);
                }
            }
            else if (!stderrCb) {
                console.error(line);
            }
            if (stderrCb) {
                stderrCb(line);
            }
            stderrBuffer = stderrBuffer.substring(newLineIndex + 1);
            lastStderrLine = line;
        }
    });

    // Create a promise for the resulting information when the process exits.
    let result = new Promise<ISpawnResult>((resolve, reject) => {
        handle.on("error", (err: Error) => {
            reject(<ISpawnError>{
                inner: err,
                message: "Failed to spawn process: " + err,
                name: "ExecError",
            });
        });
        handle.on("close", (code: number) => {
            if (dbgoutCb) {
                dbgoutCb(`Exec command: ${command}: [exit code: ${code}]`);
            }

            // If there is anything left in the buffer, add it as a line.
            if (stderrBuffer) {
                stderrLines.push(stderrBuffer);
            }
            if (stdoutBuffer) {
                stdoutLines.push(stdoutBuffer);
            }

            if (code === 0 || (opts && opts.nonZeroExitIsError === false)) {
                resolve({ code: code, stderr: stderrLines, stdout: stdoutLines });
            }
            else {
                let message: string = `${command} returned a non-zero status code [${code}]`;
                if (lastStderrLine) {
                    message += `, ${lastStderrLine}`;
                }
                reject({
                    code: code,
                    message: message,
                    name: "ExecError",
                    stderr: stderrLines,
                    stdout: stdoutLines,
                });
            }
        });
    });

    // Now return both a handle to the child process plus the promise for its results.
    return {
        handle: handle,
        result: result,
    };
}

export interface ISpawnProcess {
    handle: childProcess.ChildProcess; // A handle directly to the child process.
    result: Promise<ISpawnResult>; // A promise for the process's results (code, stderr, etc).
}

export interface ISpawnError extends Error {
    message: string; // An error message.
    code?: number; // An error code, if any.
    stdout?: string[]; // The captured stdout lines, if any and if capturing was requested w/ captureStdout.
    stderr?: string[]; // The captured stderr lines, if any and if capturing was requested w/ captureStderr.
    inner?: Error; // The inner error object, if any.
}

export interface ISpawnOptions {
    cwd?: string; // Current working directory of the child process.
    env?: any; // Object environment key-value pairs.
    encoding?: string; // Encoding (default `utf8`).
    shell?: string; // Shell to execute the command with (default: `/bin/sh` on UNIX; `cmd.exe` on Windows).
    captureStdout?: boolean; // Whether to capture stdout in the result; if false, print it (default: false).
    captureStderr?: boolean; // Whether to capture stderr in the result; if false, print it (default: false).
    nonZeroExitIsError?: boolean; // Whether a non-zero exit triggers an error (default: true).
}

export interface ISpawnResult {
    code: number; // The exit code.
    stdout?: string[]; // The lines emitted to stdout, if capturing was requested w/ captureStdout.
    stderr?: string[]; // The lines emitted to stderr, if capturing was requested w/ captureStderr.
}

