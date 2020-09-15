"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberSettingsCache = void 0;
const settings_1 = require("../../settings");
const Cache_1 = require("./Cache");
class MemberSettingsCache extends Cache_1.Cache {
    async init() {
        // NO-OP
    }
    async _get(guildId) {
        const sets = await this.client.db.getMemberSettingsForGuild(guildId);
        const map = new Map();
        sets.forEach((set) => map.set(set.memberId, Object.assign(Object.assign({}, settings_1.memberDefaultSettings), set.value)));
        return map;
    }
    async getOne(guildId, memberId) {
        const guildSets = await this.get(guildId);
        const set = guildSets.get(memberId);
        return Object.assign(Object.assign({}, settings_1.memberDefaultSettings), set);
    }
    async setOne(guildId, userId, key, value) {
        const guildSet = await this.get(guildId);
        const dbVal = settings_1.toDbValue(settings_1.memberSettingsInfo[key], value);
        let set = guildSet.get(userId);
        if (!set) {
            set = Object.assign({}, settings_1.memberDefaultSettings);
            guildSet.set(userId, set);
        }
        // Check if the value changed
        if (set[key] !== dbVal) {
            set[key] = dbVal;
            await this.client.db.saveMemberSettings({ memberId: userId, guildId, value: set });
        }
        return dbVal;
    }
}
exports.MemberSettingsCache = MemberSettingsCache;
//# sourceMappingURL=MemberSettingsCache.js.map