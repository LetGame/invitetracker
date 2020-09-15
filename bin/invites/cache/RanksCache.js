"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RanksCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
class RanksCache extends Cache_1.Cache {
    async init() {
        // TODO
    }
    async _get(guildId) {
        const ranks = await this.client.db.getRanksForGuild(guildId);
        return ranks.sort((a, b) => a.numInvites - b.numInvites);
    }
}
exports.RanksCache = RanksCache;
//# sourceMappingURL=RanksCache.js.map