"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildSettingsCache = void 0;
const settings_1 = require("../../settings");
const Cache_1 = require("./Cache");
class GuildSettingsCache extends Cache_1.Cache {
    async init() {
        // NO-OP
    }
    async _get(guildId) {
        const set = await this.client.db.getGuildSettings(guildId);
        return Object.assign(Object.assign({}, settings_1.guildDefaultSettings), (set ? set.value : null));
    }
    async setOne(guildId, key, value) {
        const set = await this.get(guildId);
        const dbVal = settings_1.toDbValue(settings_1.guildSettingsInfo[key], value);
        // Check if the value changed
        if (set[key] !== dbVal) {
            set[key] = dbVal;
            // Save into DB
            await this.client.db.saveGuildSettings({ guildId, value: set });
        }
        return dbVal;
    }
}
exports.GuildSettingsCache = GuildSettingsCache;
//# sourceMappingURL=GuildSettingsCache.js.map