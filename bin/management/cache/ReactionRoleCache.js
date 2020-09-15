"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionRoleCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
class ReactionRoleCache extends Cache_1.Cache {
    async init() {
        // TODO
    }
    async _get(guildId) {
        return this.client.db.getReactionRolesForGuild(guildId);
    }
}
exports.ReactionRoleCache = ReactionRoleCache;
//# sourceMappingURL=ReactionRoleCache.js.map