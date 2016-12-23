// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

const DEFAULT_DASH: string = '--';
const DEFAULT_DELIMITER: string = '=';

// Optionally appends an option argument, `arg`, whose name is `name`, to an array of `options`.
export function defineOption(options: string[], arg: any, name: string, opts?: IDelimitOptions): void {
    opts = defaultOptions(opts);

    if (arg !== undefined && arg !== null) {
        if (!opts.explicitBooleans && arg === true || arg === false) {
            if (arg === true) {
                options.push(opts.dash + name);
            }
        }
        else {
            // A null delimiter means to pass the value as a distinct argument.
            if (opts.delimiter === null) {
                options.push(opts.dash + name);
                options.push(arg);
            }
            else {
                options.push(opts.dash + name + opts.delimiter + arg);
            }
        }
    }
}

// Optionally appends an array of option arguments, `arg`, whose name is `name`, to an array of `options`.
export function defineOptionArray(options: string[], args: any[], name: string, opts?: IDelimitOptions): void {
    opts = defaultOptions(opts);

    if (args) {
        for (let arg of args) {
            if (!opts.explicitBooleans && arg === true || arg === false) {
                if (arg === true) {
                    options.push(opts.dash + name);
                }
            }
            else {
                // A null delimiter means to pass the value as a distinct argument.
                if (opts.arrayDelimiter === null) {
                    options.push(opts.dash + name);
                    options.push(arg);
                }
                else {
                    options.push(opts.dash + name + opts.arrayDelimiter + arg);
                }
            }
        }
    }
}

export interface IDelimitOptions {
    // The dash to use; by default, '--'.
    dash?: string;
    // The delimiter to use to separate `--arg<delim>value`. A null means to pass the value as an entirely distinct
    // argument.  By default, `=`, as in `--arg=value`.
    delimiter?: string | null;
    // The delimiter to use to separate multiple array values `--arg<delim>value`.  A null means to pass the value as
    // an entirely distinct argument.  By default, null, as in `--arg` `value` `--arg` `value`.
    arrayDelimiter?: string | null;
    // If true, boolean args are passed explicitly as 'true' and 'false'; else they stand alone.  For example,
    // --flag=true or --flag=false versus --flag and nothing, respectively.
    explicitBooleans?: boolean;
}

function defaultOptions(opts?: IDelimitOptions): IDelimitOptions {
    opts = opts || {};
    opts.dash = (opts.dash === undefined ? DEFAULT_DASH : opts.dash);
    opts.delimiter = (opts.delimiter === undefined ? DEFAULT_DELIMITER : opts.delimiter);
    opts.arrayDelimiter = (opts.arrayDelimiter === undefined ? null : opts.arrayDelimiter);
    opts.explicitBooleans = (opts.explicitBooleans === undefined ? false : opts.explicitBooleans);
    return opts;
}

