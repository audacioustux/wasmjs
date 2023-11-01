import URLSearchParams from "@ungap/url-search-params";
import { TextEncoder, TextDecoder } from "@sinonjs/text-encoding";
import httpStatus from "http-status";

class Headers {
    constructor(initialHeaders) {
        let headers = {};

        for (const key in initialHeaders) {
            let value = initialHeaders[key];

            if (typeof value === "string") {
                headers[key] = value;
            }
        }

        this.headers = headers;
    }

    append(key, value) {
        this.headers[key] = value;
        return value;
    }

    set(key, value) {
        this.append(key, value);
        return value;
    }

    delete(key) {
        let dropValue = delete this.headers[key];
        return dropValue;
    }

    get(key) {
        return this.headers[key];
    }

    toJSON() {
        return this.headers;
    }
}

class Request {
    constructor(input) {
        this.url = input.url;
        this.method = input.method;
        this.headers = new Headers(input.headers || {});
        this.body = input.body;
        this.params = input.params || {};
    }

    text() {
        return this.body;
    }
}

class Response {
    constructor(body, options = {}) {
        if (body instanceof String) {
            this.body = body.toString();
        } else {
            this.body = body;
        }

        if (options.headers instanceof Headers) {
            this.headers = options.headers;
        } else if (options.headers instanceof Object) {
            this.headers = new Headers(options.headers);
        } else {
            this.headers = new Headers({});
        }

        this.status = options.status || 200;
        this.statusText = options.statusText || httpStatus[this.status];
    }

    static redirect(url, status = 307) {
        return new Response(`Redirecting to ${url}`, {
            status,
            headers: {
                Location: url
            }
        })
    }

    get ok() {
        return this.status >= 200 && this.status < 300;
    }

    defaultEncoding() {
        return "utf-8";
    }

    arrayBuffer() {
        let parsedBody = this.body;

        if (typeof this.body === "string") {
            try {
                parsedBody = new TextEncoder().encode(this.body);
            } catch (e) {
                return Promise.reject(`err: ${e}`);
            }
        }

        return parsedBody;
    }

    json() {
        let parsedBody = this.body;

        if (typeof this.body !== "string") {
            try {
                parsedBody = new TextDecoder(this.defaultEncoding()).decode(this.body);
            } catch (e) {
                return Promise.reject(`err: ${e}`);
            }
        }

        try {
            return Promise.resolve(JSON.parse(parsedBody));
        } catch (e) {
            return Promise.reject(`err: ${e}`);
        }
    }

    text() {
        let parsedBody = this.body;

        if (typeof this.body !== "string") {
            try {
                parsedBody = new TextDecoder(this.defaultEncoding()).decode(this.body);
            } catch (e) {
                return Promise.reject(`err: ${e}`);
            }
        }

        return parsedBody;
    }

    toString() {
        return this.body;
    }
}

(function () {
    const __send_http_request = globalThis.__send_http_request;
    const __console_log = globalThis.__console_log;

    globalThis.fetch = (uri, opts) => {
        let optsWithDefault = {
            method: "GET",
            headers: {},
            body: null,
            ...opts
        };

        if (optsWithDefault.body !== null && typeof optsWithDefault.body !== "string") {
            try {
                optsWithDefault.body = new TextEncoder().encode(optsWithDefault.body);
            } catch (e) {
                return Promise.reject(`err: ${e}`)
            }
        }

        let result = __send_http_request(uri, optsWithDefault);

        if (result.error === true) {
            return Promise.reject(new Error(`[${result.type}] ${result.message}`));
        } else {
            let response = new Response(result.body, {
                headers: result.headers,
                status: result.status,
            })

            return Promise.resolve(response);
        }
    }

    globalThis.console = {
        error(msg) {
            this.log(msg);
        },
        log(msg) {
            __console_log(msg);
        },
        info(msg) {
            this.log(msg);
        },
        debug(msg) {
            this.log(msg);
        },
        warn(msg) {
            this.log(msg);
        },
        trace(msg) {
            this.log(msg);
        }
    }

    Reflect.deleteProperty(globalThis, "__send_http_request");
    Reflect.deleteProperty(globalThis, "__console_log");
})();


globalThis.URLSearchParams = URLSearchParams;
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

let handlerFunction;

globalThis.addEventListener = (_eventName, handler) => {
    handlerFunction = handler;
};

const requestToHandler = input => {
    const request = new Request(input);
    const event = {
        request,
        response: {},
        respondWith(res) {
            this.response = res;
        }
    };

    try {
        handlerFunction(event);

        Promise.resolve(
            event.response
        ).then(res => {
            result = {
                data: res.body,
                headers: res.headers.headers,
                status: res.status,
            };
        })
            .catch((err) => {
                error = `err: \n${err}`;
            });
    } catch (err) {
        error = `err: ${err}\n${err.stack}`;
    }
};

globalThis.entrypoint = requestToHandler;
globalThis.result = {};
globalThis.error = null
