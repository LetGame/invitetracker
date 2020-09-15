"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsCache = void 0;
const Cache_1 = require("./Cache");
class PermissionsCache extends Cache_1.Cache {
    async init() {
        // NO-OP
    }
    async _get(guildId) {
        const perms = await this.client.db.getRolePermissionsForGuild(guildId);
        const obj = {};
        perms.forEach((p) => {
            const cmd = p.command;
            if (!obj[cmd]) {
                obj[cmd] = [];
            }
            obj[cmd].push(p.roleId);
        });
        return obj;
    }
}
exports.PermissionsCache = PermissionsCache;
//# sourceMappingURL=PermissionsCache.js.map