"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMRequestHandler = void 0;
// tslint:disable-next-line: variable-name
const RequestHandler = require('eris/lib/rest/RequestHandler');
class IMRequestHandler extends RequestHandler {
    constructor(client, forceQueueing) {
        super(client, forceQueueing);
        this.requestStats = new Map();
    }
    request(method, url, auth, body, file, _route, short) {
        // This is similar to https://github.com/abalabahaha/eris/blob/master/lib/rest/RequestHandler.js#L46
        // but we don't actually care about rate limits, so no exceptions in grouping
        const route = url
            .replace(/\/(?:[0-9]+)/g, `/:id`)
            .replace(/\/reactions\/[^/]+/g, '/reactions/:id')
            .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token');
        const statKey = `${method}:${route}`;
        let info = this.requestStats.get(statKey);
        if (!info) {
            info = { total: 0, succeeded: 0, errors: 0 };
            this.requestStats.set(statKey, info);
        }
        info.total++;
        return super
            .request(method, url, auth, body, file, _route, short)
            .then((res) => {
            this.requestStats.get(statKey).succeeded++;
            return res;
        })
            .catch((err) => {
            this.requestStats.get(statKey).errors++;
            throw err;
        });
    }
}
exports.IMRequestHandler = IMRequestHandler;
//# sourceMappingURL=RequestHandler.js.map