"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardCache = void 0;
const moment_1 = __importDefault(require("moment"));
const Cache_1 = require("../../framework/cache/Cache");
const types_1 = require("../../types");
class LeaderboardCache extends Cache_1.Cache {
    async init() {
        this.maxCacheDuration =
            this.client.type === types_1.BotType.custom
                ? moment_1.default.duration(5, 'minute')
                : this.client.type === types_1.BotType.pro
                    ? moment_1.default.duration(1, 'hour')
                    : moment_1.default.duration(24, 'hour');
    }
    async _get(guildId) {
        return await this.client.invs.generateLeaderboard(guildId);
    }
}
exports.LeaderboardCache = LeaderboardCache;
//# sourceMappingURL=LeaderboardCache.js.map