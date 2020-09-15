"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotSetting = exports.ActivityType = exports.ActivityStatus = exports.BotSettingsKey = void 0;
var BotSettingsKey;
(function (BotSettingsKey) {
    BotSettingsKey["activityStatus"] = "activityStatus";
    BotSettingsKey["activityEnabled"] = "activityEnabled";
    BotSettingsKey["activityType"] = "activityType";
    BotSettingsKey["activityMessage"] = "activityMessage";
    BotSettingsKey["activityUrl"] = "activityUrl";
    BotSettingsKey["embedDefaultColor"] = "embedDefaultColor";
})(BotSettingsKey = exports.BotSettingsKey || (exports.BotSettingsKey = {}));
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["online"] = "online";
    ActivityStatus["dnd"] = "dnd";
    ActivityStatus["idle"] = "idle";
})(ActivityStatus = exports.ActivityStatus || (exports.ActivityStatus = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["playing"] = "playing";
    ActivityType["streaming"] = "streaming";
    ActivityType["listening"] = "listening";
    ActivityType["watching"] = "watching";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
class BotSetting {
}
exports.BotSetting = BotSetting;
//# sourceMappingURL=BotSetting.js.map