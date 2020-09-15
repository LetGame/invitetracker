"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PunishmentCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
class PunishmentCache extends Cache_1.Cache {
    async init() {
        // TODO
    }
    async _get(guildId) {
        return this.client.db.getPunishmentConfigsForGuild(guildId);
    }
}
exports.PunishmentCache = PunishmentCache;
//# sourceMappingURL=PunishmentsCache.js.map