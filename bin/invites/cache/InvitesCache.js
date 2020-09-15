"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesCache = void 0;
const moment_1 = __importDefault(require("moment"));
const Cache_1 = require("../../framework/cache/Cache");
class InvitesCache extends Cache_1.Cache {
    async init() {
        this.maxCacheDuration = moment_1.default.duration(100, 'years');
    }
    async _get(guildId) {
        const map = new Map();
        return map;
    }
    async getOne(guildId, memberId) {
        const guildInvites = await this.get(guildId);
        let invites = guildInvites.get(memberId);
        if (!invites) {
            invites = await this.client.invs.getInviteCounts(guildId, memberId);
            guildInvites.set(memberId, invites);
        }
        return invites;
    }
    hasOne(guildId, memberId) {
        const map = this.cache.get(guildId);
        return map && map.has(memberId);
    }
    flushOne(guildId, memberId) {
        const map = this.cache.get(guildId);
        if (map) {
            map.delete(memberId);
        }
    }
}
exports.InvitesCache = InvitesCache;
//# sourceMappingURL=InvitesCache.js.map