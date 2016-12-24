// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import { spawn } from "./spawn";

/** Executes a command, blocks awaiting its exit, and then returns the results. */
export async function exec(command: string, args?: string[], opts?: IExecOptions,
                           stdoutCb?: (line: string) => void, stderrCb?: (line: string) => void,
                           dbgoutCb?: (line: string) => void): Promise<IExecResult> {
    return spawn(command, args, opts, stdoutCb, stderrCb, dbgoutCb).result;
}

export interface IExecOptions {
    cwd?: string; // Current working directory of the child process.
    env?: any; // Object environment key-value pairs.
    encoding?: string; // Encoding (default `utf8`).
    shell?: string; // Shell to execute the command with (default: `/bin/sh` on UNIX; `cmd.exe` on Windows).
    captureStdout?: boolean; // Whether to capture stdout in the result; if false, print it (default: false).
    captureStderr?: boolean; // Whether to capture stderr in the result; if false, print it (default: false).
    nonZeroExitIsError?: boolean; // Whether a non-zero exit triggers an error (default: true).
}

export interface IExecError extends Error {
    message: string; // An error message.
    code?: number; // An error code, if any.
    stdout?: string[]; // The captured stdout lines, if any and if capturing was requested w/ captureStdout.
    stderr?: string[]; // The captured stderr lines, if any and if capturing was requested w/ captureStderr.
    inner?: Error; // The inner error object, if any.
}

export interface IExecResult {
    code: number; // The exit code.
    stdout?: string[]; // The lines emitted to stdout, if capturing was requested w/ captureStdout.
    stderr?: string[]; // The lines emitted to stderr, if capturing was requested w/ captureStderr.
}

