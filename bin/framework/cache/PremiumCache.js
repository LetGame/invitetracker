"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumCache = void 0;
const types_1 = require("../../types");
const Cache_1 = require("./Cache");
class PremiumCache extends Cache_1.Cache {
    async init() {
        // NO-OP
    }
    // This is public on purpose, so we can use it in the IMClient class
    async _get(guildId) {
        // Custom bots always have premium
        if (this.client.type === types_1.BotType.custom) {
            return true;
        }
        const sub = await this.client.db.getPremiumSubscriptionGuildForGuild(guildId);
        return !!sub;
    }
}
exports.PremiumCache = PremiumCache;
//# sourceMappingURL=PremiumCache.js.map