"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlatform = void 0;
class MusicPlatform {
    constructor(client) {
        this.client = client;
    }
    get service() {
        return this.client.music;
    }
}
exports.MusicPlatform = MusicPlatform;
//# sourceMappingURL=MusicPlatform.js.map