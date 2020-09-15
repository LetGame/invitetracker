"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteCodeSettingsCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
const settings_1 = require("../../settings");
class InviteCodeSettingsCache extends Cache_1.Cache {
    async init() {
        // TODO
    }
    async _get(guildId) {
        const sets = await this.client.db.getInviteCodeSettingsForGuild(guildId);
        const map = new Map();
        sets.forEach((set) => map.set(set.inviteCode, Object.assign(Object.assign({}, settings_1.inviteCodeDefaultSettings), set.value)));
        return map;
    }
    async getOne(guildId, invCode) {
        const guildSets = await this.get(guildId);
        const set = guildSets.get(invCode);
        return Object.assign(Object.assign({}, settings_1.inviteCodeDefaultSettings), set);
    }
    async setOne(guildId, inviteCode, key, value) {
        const guildSet = await this.get(guildId);
        const dbVal = settings_1.toDbValue(settings_1.inviteCodeSettingsInfo[key], value);
        let set = guildSet.get(inviteCode);
        if (!set) {
            set = Object.assign({}, settings_1.inviteCodeDefaultSettings);
            guildSet.set(inviteCode, set);
        }
        // Check if the value changed
        if (set[key] !== dbVal) {
            set[key] = dbVal;
            await this.client.db.saveInviteCodeSettings({ inviteCode, guildId, value: set });
        }
        return dbVal;
    }
}
exports.InviteCodeSettingsCache = InviteCodeSettingsCache;
//# sourceMappingURL=InviteCodeSettingsCache.js.map