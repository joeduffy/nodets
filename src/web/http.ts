// Copyright 2016 Joe Duffy. All rights reserved.

"use strict";

import * as assert from "assert";
import * as nodeHttp from "http";
import * as nodeHttps from "https";
import * as querystring from "querystring";
import * as url from "url";

// An enum of all possible HTTP/1.1 methods; see http://www.iana.org/assignments/http-methods/http-methods.xhtml.
export enum HttpMethod {
    // RFC7231, Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content
    DELETE,
    GET,
    HEAD,
    OPTIONS,
    POST,
    PUT,
    TRACE,

    // RFC5789, Patch Method for HTTP
    PATCH,

    // RFC2068, Hypertext Transfer Protocol (HTTP/1.1)
    LINK,
    UNLINK,

    // RFC3253, Versioning Extensions to WebDAV
    "BASELINE-CONTROL",
    CHECKIN,
    CHECKOUT,
    LABEL,
    MERGE,
    MKACTIVITY,
    MKWORKSPACE,
    REPORT,
    UNCHECKOUT,
    UPDATE,
    "VERSION-CONTROL",

    // RFC3648, WebDAV Ordered Collections Protocol
    ORDERPATCH,

    // RFC3744, WebDAV Access Control Protocol
    ACL,

    // RFC4437, WebDAV Redirect Reference Resources
    MKREDIRECTREF,
    UPDATEREDIRECTREF,

    // RFC4791, Calendaring Extensions to WebDAV
    MKCALENDAR,

    // RFC4918, HTTP Extensions for WebDAV
    COPY,
    LOCK,
    MKCOL,
    MOVE,
    PROPFIND,
    PROPPATCH,
    UNLOCK,

    // RFC5323, WebDAV Search
    SEARCH,

    // RFC5842, Binding Extensions to WebDAV
    BIND,
    REBIND,
    UNBIND,

    // RFC7540, Hypertext Transfer Protocol Version 2 (HTTP/2)
    PRI
};

// Fetches all HTTP method names.
export function getHttpMethodNames(): string[] {
    return Object.keys(HttpMethod).filter(v => isNaN(parseInt(v, 10)));
}

// A convenient alias for an array of HTTP headers.
export type HttpHeaders = { [key: string]: any };

// An enum of all possible HTTP/1.1 status codes; see
// http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml.
export let httpStatusCodes = new Map<number, string>([
    // Informational 1xx
    [ 100, "Continue" ],
    [ 101, "Switching Protocols" ],
    [ 102, "Processing" ],
    // 103-199 Unassigned

    // Successful 2xx
    [ 200, "OK" ],
    [ 201, "Created" ],
    [ 202, "Accepted" ],
    [ 203, "Non-Authoritative Information" ],
    [ 204, "No Content" ],
    [ 205, "Reset Content" ],
    [ 206, "Partial Content" ],
    [ 207, "Multi-Status" ],
    [ 208, "Already Reported" ],
    // 209-225 Unassigned
    [ 226, "IM Used" ],
    // 227-299 Unassigned

    // Redirection 3xx
    [ 300, "Multiple Choices" ],
    [ 301, "Moved Permanently" ],
    [ 302, "Found" ],
    [ 303, "See Other" ],
    [ 304, "Not Modified" ],
    [ 305, "Use Proxy" ],
    [ 306, "(Unused)" ],
    [ 307, "Temporary Redirect" ],
    [ 308, "Permanent Redirect" ],
    // 309-399 Unassigned

    // Client Errors 4xx
    [ 400, "Bad Request" ],
    [ 401, "Unauthorized" ],
    [ 402, "Payment Required" ],
    [ 403, "Forbidden" ],
    [ 404, "Not Found" ],
    [ 405, "Method Not Allowed" ],
    [ 406, "Not Acceptable" ],
    [ 407, "Proxy Authentication Required" ],
    [ 408, "Request Timeout" ],
    [ 409, "Conflict" ],
    [ 410, "Gone" ],
    [ 411, "Length Required" ],
    [ 412, "Precondition Failed" ],
    [ 413, "Request Entity Too Large" ],
    [ 414, "Request URI Too Long" ],
    [ 415, "Unsupported Media Type" ],
    [ 416, "Requested Range Not Satisfied" ],
    [ 417, "Expectation Failed" ],
    // 418-420 Unassigned
    [ 421, "Misdirect Request" ],
    [ 422, "Unprocessable Entity" ],
    [ 423, "Locked" ],
    [ 424, "Failed Dependency" ],
    // 425 Unassigned
    [ 426, "Upgrade Required" ],
    // 427 Unassigned
    [ 428, "Precondition Required" ],
    [ 429, "Too Many Requests" ],
    // 430 Unassigned
    [ 431, "Request Header Fields Too Large" ],
    // 432-499 Unassigned

    // Server Errors 5xx
    [ 500, "Internal Server Error" ],
    [ 501, "Not Implemented" ],
    [ 502, "Bad Gateway" ],
    [ 503, "Service Unavailable" ],
    [ 504, "Gateway Timeout" ],
    [ 505, "HTTP Version Not Supported" ],
    [ 506, "Variant Also Negotiates" ],
    [ 507, "Insufficient Storage" ],
    [ 508, "Loop Detected" ],
    // 509 Unassigned
    [ 510, "Not Extended" ],
    [ 511, "Network Authentication Required" ],
    // 512-599 Unassigned
]);

// A prompt HTTP response object.  This is not streaming, so is best for "short", simple replies.
export class HttpResponse {
    public code: number;         // The resulting response's HTTP status code.
    public headers: HttpHeaders; // The response headers.
    public rawPayload: string;   // The raw, unparsed response payload, in string form.
    public payload: any;         // The parsed, JSON response payload, if the server replied with JSON.

    constructor(code: number, headers?: HttpHeaders, rawPayload?: string, payload?: any) {
        this.code = code;
        this.headers = headers || [];
        this.rawPayload = rawPayload || "";
        this.payload = payload;
    }

    // Checks whether the response is successful or not.
    public isSuccess(): boolean {
        // Any 2xx is a success:
        return this.code >= 200 && this.code < 300;
    }

    // Throws an HttpError if the response wasn't successful (anything other than 2xx).
    public throwIfNotSuccess(message?: string): void {
        if (!this.isSuccess()) {
            throw new HttpError(this, message);
        }
    }
}

// A type for cases where HTTP errors are being propagated.
export class HttpError extends Error {
    public response: HttpResponse;

    constructor(response: HttpResponse, message?: string) {
        assert(response);
        super(
            (message || "An unsuccessful HTTP status code was returned") +
            " <" + response.code + ">");
        this.response = response;
    }
}

export type UrlOrString = url.Url | string;

// Performs an HTTP (or HTTPS) operation against the given URL using the given method.  An optional payload can be
// provided; it is assumed to be of type `application/json`, unless it's overridden with the content type argument.
// An optional set of headers can be included.  The return type is assumed to be JSON and is parsed accordingly.
export function http(
        href: UrlOrString, method?: HttpMethod,
        payload?: any, contentType?: string,
        headers?: HttpHeaders,
        dbgoutCb?: (line: string) => void): Promise<HttpResponse> {
    assert(href);

    // We let callers pass in string-based URLs for convenience; if it's one, parse it first.
    let hrefUrl: url.Url;
    if (typeof href === "string") {
        hrefUrl = url.parse(href);
    }
    else {
        hrefUrl = <url.Url>href;
    }

    // Default to GET if the caller didn't request a method.
    if (method === undefined) {
        method = HttpMethod.GET;
    }

    let debugUrl: string | undefined;
    if (dbgoutCb) {
        debugUrl = `${hrefUrl.protocol}//${hrefUrl.hostname}:${hrefUrl.port}${hrefUrl.path}`;
        dbgoutCb(`Executing web action:`);
        dbgoutCb(`    url: ${debugUrl}`);
        dbgoutCb(`    method: ${HttpMethod[method]}`);
        if (payload) {
            dbgoutCb(`    payload: ${JSON.stringify(payload)}`);
        }
        if (contentType) {
            dbgoutCb(`    contentType: ${contentType}`);
        }
        if (headers) {
            dbgoutCb(`    headers: ${JSON.stringify(headers)}`);
        }
    }

    // Pick the right HTTP library based on the URL's protocol.
    let rest: any;
    switch (hrefUrl.protocol) {
        case "http:":
            rest = nodeHttp;
            break;
        case "https:":
            rest = nodeHttps;
            break;
        default:
            throw new Error("Unsupported HTTP protocol: \"" + hrefUrl.protocol + "\"");
    }

    // Normalize all headers to lower-case to avoid duplicates.
    headers = headers || {};
    for (let header of Object.keys(headers)) {
        let value: any = headers[header];
        delete headers[header];
        headers[header.toLowerCase()] = value;
    }

    // Set some default header values.
    headers["user-agent"] = headers["user-agent"] || "NodeTS";

    // If a content type was specified, bash the header value even if it already exists.
    if (contentType) {
        headers["content-type"] = contentType;
    }

    // Serialize the payload as appropriate.
    let payloadData: string;
    if (payload) {
        // If there's a content type, ignore the parameters for purposes of this check.
        if (contentType && contentType.indexOf(";") !== -1) {
            contentType = contentType.substring(0, contentType.indexOf(";"));
        }

        if (contentType === "application/x-www-form-urlencoded") {
            // We"re doing a multipart form encoded upload; use querystring format.
            payloadData = querystring.stringify(payload);
        }
        else {
            // Else, simply stringify the JSON, and make sure the content-type is set.
            payloadData = JSON.stringify(payload);
            if (!contentType) {
                headers["content-type"] = "application/json";
            }
        }

        // Ensure the content length matches the byte (octet) length of the payload we"re sending.
        headers["content-length"] = Buffer.byteLength(payloadData);

        if (dbgoutCb) {
            dbgoutCb(`    payloadData: ${payloadData}`);
        }
    }

    if (dbgoutCb) {
        dbgoutCb(`    headers: ${JSON.stringify(headers)}`);
    }

    // Now do it!
    return new Promise<any>((resolve, reject) => {
        try {
            let req: nodeHttp.ClientRequest = rest.request(
                {
                    auth: hrefUrl.auth,
                    headers: headers,
                    hostname: hrefUrl.hostname,
                    method: HttpMethod[<HttpMethod>method],
                    path: hrefUrl.path,
                    port: hrefUrl.port,
                },
                (res: nodeHttp.IncomingMessage) => {
                    // Assume the response is UTF8.
                    // TODO: support additional encodings?
                    res.setEncoding("utf8");

                    // Begin building up all the response information.
                    let ret = new HttpResponse(<number>res.statusCode, res.headers);

                    // Read the response.
                    res.on("data", (chunk: string) => {
                        ret.rawPayload += chunk;
                    });
                    res.on("end", () => {
                        try {
                            if (dbgoutCb) {
                                dbgoutCb("\tresponse: " + ret.code);
                                dbgoutCb("\theaders : " + JSON.stringify(ret.headers));
                                dbgoutCb("\tpayload : " + ret.rawPayload);
                            }

                            // If the response was JSON, make the parsed form available.
                            if (ret.rawPayload && res.headers["content-type"] &&
                                    (res.headers["content-type"].indexOf("application/json") === 0 ||
                                     res.headers["content-type"].indexOf("text/javascript") === 0)) {
                                ret.payload = JSON.parse(ret.rawPayload);
                            }
                        }
                        catch (err) {
                            reject("HTTP action failed during completion: " + err);
                        }

                        // HTTP errors aren't an error from this API's perspective.  Callers must check the code.
                        resolve(ret);
                    });
                }
            );

            try {
                req.on("error", (err: NodeJS.ErrnoException) => {
                    reject("HTTP action failed partway through: " + err);
                });

                if (payload) {
                    req.write(payloadData);
                }
            }
            finally {
                req.end(() => {
                    if (dbgoutCb) {
                        dbgoutCb(`Web action request ended: ${debugUrl}`);
                    }
                });
            }
        }
        catch (err) {
            reject("HTTP action failed: " + err);
        }
    });
}

