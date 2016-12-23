// Copyright 2016 Joe Duffy. All rights reserved.

'use strict';

import * as url from 'url';

// A few helper methods for dealing with URLs.
export abstract class Url {
    // Appends path strings to an existing base URL.  Note that if the base isn't a very good base path, such as it
    // having a hash or querystring, those components are retained as-is.
    public static join(base: url.Url, ...paths: string[]): url.Url {
        // First clone the base as our starting point.
        let result: url.Url = Url.clone(base);

        // A little helper routine used for appending paths below.
        let appendAt = (path: string | undefined, append: string, index?: number): string => {
            if (index === undefined) {
                if (path) {
                    index = path.length;
                }
                else {
                    index = 0;
                }
            }

            let extract: string = path ? path.substring(0, index) : '';
            let firstAppendIsSlash: boolean = (append && append[0] === '/') ? true : false;
            let lastExistingIsSlash: boolean = (extract && extract[extract.length-1] === '/') ? true : false;
            if (!firstAppendIsSlash && (!extract || !lastExistingIsSlash)) {
                // If the existing path doesn't already have a trailing /, and the piece to append doesn't begin with
                // one, we need to explicitly delimit the new appended piece with one.
                extract += '/';
            }
            else if (firstAppendIsSlash && lastExistingIsSlash) {
                // If the existing path ends with a /, and the new piece starts with one, eliminate one so we don't
                // end up with double adjacent slashes (i.e., //).
                append = append.substring(1);
            }
            return extract + append + (path ? path.substring(index) : '');
        };

        // Join the paths, but use our helper above to ensure we don't end up with adjacent slashes.
        let joined: string = '';
        for (let path of paths) {
            joined = appendAt(joined, path);
        }

        // The fields that could contain a path include:
        //     pathname, just the path part
        //     path, the path plus the querystring
        //     href, the whole stringified URL
        // Note that path and pathname could be null, if the base was host-only.

        result.pathname = appendAt(result.pathname, joined);

        {
            let queryIndex = result.path ? result.path.indexOf('?') : -1;
            if (queryIndex !== -1) {
                // If there's a querystring part, inject our new path just before it.
                result.path = appendAt(result.path, joined, queryIndex);
            }
            else {
                // Otherwise, simply append it.
                result.path = appendAt(result.path, joined);
            }
        }

        {
            let queryIndex = result.href ? result.href.indexOf('?') : -1;
            let anchorIndex = result.href ? result.href.indexOf('#') : -1;
            if (queryIndex !== -1) {
                // If there's a querystring, like above, inject our new path just before it.
                result.href = appendAt(result.href, joined, queryIndex);
            }
            else if (anchorIndex !== -1) {
                // If there's an anchor, similarly, the new path must come before.
                result.href = appendAt(result.href, joined, anchorIndex);
            }
            else {
                // Finally, if neither, just append it to the end.
                result.href = appendAt(result.href, joined);
            }
        }

        return result;
    }

    // Clones an existing Url object, so the result can be mutated independently.
    public static clone(from: url.Url): url.Url {
        return {
            auth: from.auth,
            hash: from.hash,
            host: from.host,
            hostname: from.hostname,
            href: from.href,
            path: from.path,
            pathname: from.pathname,
            port: from.port,
            protocol: from.protocol,
            query: from.query,
            search: from.search,
            slashes: from.slashes,
        };
    }
}

