// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

/** A simple interface to perform cancellation. */
export interface ICancellable {
    cancel(): Promise<void>;
}

