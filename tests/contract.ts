// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as contract from '../src/contract';

function contractFailReturn(): number {
    return contract.fail();
}

function contractFailfReturn(): number {
    return contract.fail("Test %s", "failf");
}

