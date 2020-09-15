"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMService = void 0;
class IMService {
    constructor(client) {
        this.client = null;
        this.client = client;
    }
    async init() {
        // NO-OP
    }
    async onClientReady() {
        this.startupDone();
    }
    startupDone() {
        this.client.serviceStartupDone(this);
    }
}
exports.IMService = IMService;
//# sourceMappingURL=Service.js.map