"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
class MusicCache extends Cache_1.Cache {
    async init() {
        this.client.guilds.forEach((g) => this.cache.set(g.id, this.cache.get(g.id) || {
            current: null,
            queue: []
        }));
    }
    async _get(guildId) {
        return {
            current: null,
            queue: []
        };
    }
}
exports.MusicCache = MusicCache;
//# sourceMappingURL=MusicCache.js.map