// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as mkdirpModule from 'mkdirp';
import * as path from 'path';
import * as os from 'os';

/** Changes the permissions mode on the target file. */
export function chmod(path: string, mode: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.chmod(path, mode, (err: NodeJS.ErrnoException) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/** Checks whether the given path exists, returning true if it does, false if it doesn't. */
export async function exists(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        fs.lstat(path, (err: NodeJS.ErrnoException) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

/** Makes a directory. */
export function mkdir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(path, (err: NodeJS.ErrnoException) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/**
 * Makes a directory, mimicking the behavior of UNIX's `mkdir -p`.  In other words, if the directory already exists,
 * the command does nothing.  If any part of the path is missing, those directories are created.
 */
export async function mkdirp(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        mkdirpModule(path, (err: Error | undefined) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/** Reads the contents of a directory, returning an array of names (excluding `.` and `..`). */
export function readDir(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, (err: NodeJS.ErrnoException, files: string[]) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files);
            }
        });
    });
}

/** Reads a file from the given path. */
export function readFile(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

/** Stats a file or directory. */
export function stat(path: string): Promise<IStats> {
    return new Promise<IStats>((resolve, reject) => {
        fs.stat(path, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stats);
            }
        });
    });
}

/**
 * Stats a file or directory.  This is like `stat` except that if the target is a symlink, the link itself is stat-ed
 * and not the file that it refers to.
 */
export function lstat(path: string): Promise<IStats> {
    return new Promise<IStats>((resolve, reject) => {
        fs.lstat(path, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stats);
            }
        });
    });
}

/** Unlinks (deletes) a path. */
export function unlink(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.unlink(path, (err: NodeJS.ErrnoException) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/** Writes a file out to the given path. */
export function writeFile(path: string, data: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, data, (err: NodeJS.ErrnoException) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/** Creates a temporary file/directory name (but not the file itself). */
export function tmpName(prefix?: string, suffix?: string): string {
    // Generate a "random" name consisting only of alphanumeric characters.
    let nameBytes: Buffer;
    const length: number = 24;
    try {
        nameBytes = crypto.randomBytes(length);
    }
    catch (_) {
        // Fallback to pseudo-random if a true cryptographic random source of entropy is unavailable.
        nameBytes = crypto.pseudoRandomBytes(length);
    }

    let name: string = '';
    const legalChars: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i: number = 0; i < length; i++) {
        name += legalChars[nameBytes[i] % legalChars.length];
    }

    prefix = prefix || '';
    suffix = suffix || '';
    return path.join(os.tmpdir(), prefix + name + suffix);
}

// The result of inspecting a file or directory.
export interface IStats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}

