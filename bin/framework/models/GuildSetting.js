"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildSetting = exports.AnnouncementVoice = exports.RankAssignmentStyle = exports.LeaderboardStyle = exports.Lang = exports.GuildSettingsKey = void 0;
var GuildSettingsKey;
(function (GuildSettingsKey) {
    // General
    GuildSettingsKey["prefix"] = "prefix";
    GuildSettingsKey["lang"] = "lang";
    GuildSettingsKey["getUpdates"] = "getUpdates";
    GuildSettingsKey["logChannel"] = "logChannel";
    GuildSettingsKey["channels"] = "channels";
    GuildSettingsKey["ignoredChannels"] = "ignoredChannels";
    // Join and leave
    GuildSettingsKey["joinRoles"] = "joinRoles";
    GuildSettingsKey["joinMessage"] = "joinMessage";
    GuildSettingsKey["joinMessageChannel"] = "joinMessageChannel";
    GuildSettingsKey["leaveMessage"] = "leaveMessage";
    GuildSettingsKey["leaveMessageChannel"] = "leaveMessageChannel";
    // Leaderboard
    GuildSettingsKey["leaderboardStyle"] = "leaderboardStyle";
    GuildSettingsKey["hideLeftMembersFromLeaderboard"] = "hideLeftMembersFromLeaderboard";
    // Fakes and leaves
    GuildSettingsKey["autoSubtractFakes"] = "autoSubtractFakes";
    GuildSettingsKey["autoSubtractLeaves"] = "autoSubtractLeaves";
    GuildSettingsKey["autoSubtractLeaveThreshold"] = "autoSubtractLeaveThreshold";
    // Ranks
    GuildSettingsKey["rankAssignmentStyle"] = "rankAssignmentStyle";
    GuildSettingsKey["rankAnnouncementChannel"] = "rankAnnouncementChannel";
    GuildSettingsKey["rankAnnouncementMessage"] = "rankAnnouncementMessage";
    // Muted
    GuildSettingsKey["mutedRole"] = "mutedRole";
    // Captcha
    GuildSettingsKey["captchaVerificationOnJoin"] = "captchaVerificationOnJoin";
    GuildSettingsKey["captchaVerificationWelcomeMessage"] = "captchaVerificationWelcomeMessage";
    GuildSettingsKey["captchaVerificationSuccessMessage"] = "captchaVerificationSuccessMessage";
    GuildSettingsKey["captchaVerificationFailedMessage"] = "captchaVerificationFailedMessage";
    GuildSettingsKey["captchaVerificationTimeout"] = "captchaVerificationTimeout";
    GuildSettingsKey["captchaVerificationLogEnabled"] = "captchaVerificationLogEnabled";
    // Moderation - Meta
    GuildSettingsKey["modLogChannel"] = "modLogChannel";
    GuildSettingsKey["modPunishmentBanDeleteMessage"] = "modPunishmentBanDeleteMessage";
    GuildSettingsKey["modPunishmentKickDeleteMessage"] = "modPunishmentKickDeleteMessage";
    GuildSettingsKey["modPunishmentSoftbanDeleteMessage"] = "modPunishmentSoftbanDeleteMessage";
    GuildSettingsKey["modPunishmentWarnDeleteMessage"] = "modPunishmentWarnDeleteMessage";
    GuildSettingsKey["modPunishmentMuteDeleteMessage"] = "modPunishmentMuteDeleteMessage";
    // Moderation - General
    GuildSettingsKey["autoModEnabled"] = "autoModEnabled";
    GuildSettingsKey["autoModModeratedChannels"] = "autoModModeratedChannels";
    GuildSettingsKey["autoModModeratedRoles"] = "autoModModeratedRoles";
    GuildSettingsKey["autoModIgnoredChannels"] = "autoModIgnoredChannels";
    GuildSettingsKey["autoModIgnoredRoles"] = "autoModIgnoredRoles";
    GuildSettingsKey["autoModDeleteBotMessage"] = "autoModDeleteBotMessage";
    GuildSettingsKey["autoModDeleteBotMessageTimeoutInSeconds"] = "autoModDeleteBotMessageTimeoutInSeconds";
    GuildSettingsKey["autoModLogEnabled"] = "autoModLogEnabled";
    // Moderation - Old members
    GuildSettingsKey["autoModDisabledForOldMembers"] = "autoModDisabledForOldMembers";
    GuildSettingsKey["autoModDisabledForOldMembersThreshold"] = "autoModDisabledForOldMembersThreshold";
    // Moderation - Invites
    GuildSettingsKey["autoModInvitesEnabled"] = "autoModInvitesEnabled";
    // Moderation - Links
    GuildSettingsKey["autoModLinksEnabled"] = "autoModLinksEnabled";
    GuildSettingsKey["autoModLinksWhitelist"] = "autoModLinksWhitelist";
    GuildSettingsKey["autoModLinksBlacklist"] = "autoModLinksBlacklist";
    GuildSettingsKey["autoModLinksFollowRedirects"] = "autoModLinksFollowRedirects";
    // Moderation - Words
    GuildSettingsKey["autoModWordsEnabled"] = "autoModWordsEnabled";
    GuildSettingsKey["autoModWordsBlacklist"] = "autoModWordsBlacklist";
    // Moderation - CAPS
    GuildSettingsKey["autoModAllCapsEnabled"] = "autoModAllCapsEnabled";
    GuildSettingsKey["autoModAllCapsMinCharacters"] = "autoModAllCapsMinCharacters";
    GuildSettingsKey["autoModAllCapsPercentageCaps"] = "autoModAllCapsPercentageCaps";
    // Moderation - Duplicate text
    GuildSettingsKey["autoModDuplicateTextEnabled"] = "autoModDuplicateTextEnabled";
    GuildSettingsKey["autoModDuplicateTextTimeframeInSeconds"] = "autoModDuplicateTextTimeframeInSeconds";
    // Moderation - Quick messages
    GuildSettingsKey["autoModQuickMessagesEnabled"] = "autoModQuickMessagesEnabled";
    GuildSettingsKey["autoModQuickMessagesNumberOfMessages"] = "autoModQuickMessagesNumberOfMessages";
    GuildSettingsKey["autoModQuickMessagesTimeframeInSeconds"] = "autoModQuickMessagesTimeframeInSeconds";
    // Moderation - User mentions
    GuildSettingsKey["autoModMentionUsersEnabled"] = "autoModMentionUsersEnabled";
    GuildSettingsKey["autoModMentionUsersMaxNumberOfMentions"] = "autoModMentionUsersMaxNumberOfMentions";
    // Moderation - Role mentions
    GuildSettingsKey["autoModMentionRolesEnabled"] = "autoModMentionRolesEnabled";
    GuildSettingsKey["autoModMentionRolesMaxNumberOfMentions"] = "autoModMentionRolesMaxNumberOfMentions";
    // Moderation - Emojis
    GuildSettingsKey["autoModEmojisEnabled"] = "autoModEmojisEnabled";
    GuildSettingsKey["autoModEmojisMaxNumberOfEmojis"] = "autoModEmojisMaxNumberOfEmojis";
    // Moderation - Hoist
    GuildSettingsKey["autoModHoistEnabled"] = "autoModHoistEnabled";
    // Music - General
    GuildSettingsKey["musicVolume"] = "musicVolume";
    // Music - Announcements
    GuildSettingsKey["announceNextSong"] = "announceNextSong";
    GuildSettingsKey["announcementVoice"] = "announcementVoice";
    // Music - Fade on talk
    GuildSettingsKey["fadeMusicOnTalk"] = "fadeMusicOnTalk";
    GuildSettingsKey["fadeMusicEndDelay"] = "fadeMusicEndDelay";
    // Music - Platforms
    GuildSettingsKey["defaultMusicPlatform"] = "defaultMusicPlatform";
    GuildSettingsKey["disabledMusicPlatforms"] = "disabledMusicPlatforms";
})(GuildSettingsKey = exports.GuildSettingsKey || (exports.GuildSettingsKey = {}));
var Lang;
(function (Lang) {
    Lang["ar"] = "ar";
    Lang["bg"] = "bg";
    Lang["cs"] = "cs";
    Lang["de"] = "de";
    Lang["el"] = "el";
    Lang["en"] = "en";
    Lang["es"] = "es";
    Lang["fr"] = "fr";
    Lang["hu"] = "hu";
    Lang["id_ID"] = "id_ID";
    Lang["it"] = "it";
    Lang["ja"] = "ja";
    Lang["lt"] = "lt";
    Lang["nl"] = "nl";
    Lang["pl"] = "pl";
    Lang["pt"] = "pt";
    Lang["pt_BR"] = "pt_BR";
    Lang["ro"] = "ro";
    Lang["ru"] = "ru";
    Lang["sr"] = "sr";
    Lang["tr"] = "tr";
    Lang["zh_CN"] = "zh_CN";
    Lang["zh_TW"] = "zh_TW";
})(Lang = exports.Lang || (exports.Lang = {}));
var LeaderboardStyle;
(function (LeaderboardStyle) {
    LeaderboardStyle["normal"] = "normal";
    LeaderboardStyle["table"] = "table";
    LeaderboardStyle["mentions"] = "mentions";
})(LeaderboardStyle = exports.LeaderboardStyle || (exports.LeaderboardStyle = {}));
var RankAssignmentStyle;
(function (RankAssignmentStyle) {
    RankAssignmentStyle["all"] = "all";
    RankAssignmentStyle["highest"] = "highest";
    RankAssignmentStyle["onlyAdd"] = "onlyAdd";
})(RankAssignmentStyle = exports.RankAssignmentStyle || (exports.RankAssignmentStyle = {}));
var AnnouncementVoice;
(function (AnnouncementVoice) {
    AnnouncementVoice["Joanna"] = "Joanna";
    AnnouncementVoice["Salli"] = "Salli";
    AnnouncementVoice["Kendra"] = "Kendra";
    AnnouncementVoice["Kimberly"] = "Kimberly";
    AnnouncementVoice["Ivy"] = "Ivy";
    AnnouncementVoice["Matthew"] = "Matthew";
    AnnouncementVoice["Justin"] = "Justin";
    AnnouncementVoice["Joey"] = "Joey";
})(AnnouncementVoice = exports.AnnouncementVoice || (exports.AnnouncementVoice = {}));
class GuildSetting {
}
exports.GuildSetting = GuildSetting;
//# sourceMappingURL=GuildSetting.js.map