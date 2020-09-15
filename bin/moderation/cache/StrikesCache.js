"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrikesCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
class StrikesCache extends Cache_1.Cache {
    async init() {
        // TODO
    }
    async _get(guildId) {
        return this.client.db.getStrikeConfigsForGuild(guildId);
    }
}
exports.StrikesCache = StrikesCache;
//# sourceMappingURL=StrikesCache.js.map