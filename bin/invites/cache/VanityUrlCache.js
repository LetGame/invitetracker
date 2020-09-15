"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanityUrlCache = void 0;
const Cache_1 = require("../../framework/cache/Cache");
const types_1 = require("../../types");
class VanityUrlCache extends Cache_1.Cache {
    async init() {
        // NO-OP
    }
    async _get(guildId) {
        const guild = this.client.guilds.get(guildId);
        if (!guild || !guild.features.includes(types_1.GuildFeature.VANITY_URL)) {
            return null;
        }
        return (guild.vanityURL ||
            guild
                .getVanity()
                .then((r) => r.code)
                .catch(() => null));
    }
}
exports.VanityUrlCache = VanityUrlCache;
//# sourceMappingURL=VanityUrlCache.js.map