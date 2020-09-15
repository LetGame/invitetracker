"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beautify = exports.toDbValue = exports.botDefaultSettings = exports.botSettingsInfo = exports.inviteCodeDefaultSettings = exports.inviteCodeSettingsInfo = exports.memberDefaultSettings = exports.memberSettingsInfo = exports.guildDefaultSettings = exports.guildSettingsInfo = exports.SettingsGroup = void 0;
const BotSetting_1 = require("./framework/models/BotSetting");
const GuildSetting_1 = require("./framework/models/GuildSetting");
const InviteCodeSetting_1 = require("./framework/models/InviteCodeSetting");
const MemberSetting_1 = require("./framework/models/MemberSetting");
const types_1 = require("./types");
var SettingsGroup;
(function (SettingsGroup) {
    SettingsGroup["general"] = "general";
    SettingsGroup["invites"] = "invites";
    SettingsGroup["moderation"] = "moderation";
    SettingsGroup["joins"] = "joins";
    SettingsGroup["leaves"] = "leaves";
    SettingsGroup["leaderboard"] = "leaderboard";
    SettingsGroup["fakes"] = "fakes";
    SettingsGroup["ranks"] = "ranks";
    SettingsGroup["captcha"] = "captcha";
    SettingsGroup["logging"] = "logging";
    SettingsGroup["links"] = "links";
    SettingsGroup["bannedWords"] = "bannedWords";
    SettingsGroup["caps"] = "caps";
    SettingsGroup["duplicate"] = "duplicate";
    SettingsGroup["spam"] = "spam";
    SettingsGroup["mentions"] = "mentions";
    SettingsGroup["emojis"] = "emojis";
    SettingsGroup["music"] = "music";
    SettingsGroup["bot"] = "bot";
    SettingsGroup["fadeMusic"] = "fadeMusic";
    SettingsGroup["announcement"] = "announcement";
    SettingsGroup["platform"] = "platform";
})(SettingsGroup = exports.SettingsGroup || (exports.SettingsGroup = {}));
exports.guildSettingsInfo = {
    prefix: {
        type: 'String',
        grouping: [SettingsGroup.general],
        defaultValue: '!',
        exampleValues: ['+', '>']
    },
    lang: {
        type: 'Enum<Lang>',
        grouping: [SettingsGroup.general],
        defaultValue: GuildSetting_1.Lang.en,
        possibleValues: Object.values(GuildSetting_1.Lang)
    },
    logChannel: {
        type: 'Channel',
        grouping: [SettingsGroup.general],
        defaultValue: null,
        exampleValues: ['#channel']
    },
    getUpdates: {
        type: 'Boolean',
        grouping: [SettingsGroup.general],
        defaultValue: true
    },
    channels: {
        type: 'Channel[]',
        grouping: [SettingsGroup.general],
        defaultValue: []
    },
    ignoredChannels: {
        type: 'Channel[]',
        grouping: [SettingsGroup.general],
        defaultValue: []
    },
    joinRoles: {
        type: 'Role[]',
        grouping: [SettingsGroup.invites, SettingsGroup.general],
        defaultValue: []
    },
    joinMessage: {
        type: 'String',
        grouping: [SettingsGroup.invites, SettingsGroup.joins],
        defaultValue: '{memberMention} **just joined.**\n🔸Account was created **{memberCreated:timeAgo}**.\n🔸Invited by **{inviterName}**.\n🔸{inviterName} now at **{numInvites} invites**.',
        hasPremiumInfo: true
    },
    joinMessageChannel: {
        type: 'Channel',
        grouping: [SettingsGroup.invites, SettingsGroup.joins],
        defaultValue: null,
        exampleValues: ['#general', '#joins']
    },
    leaveMessage: {
        type: 'String',
        grouping: [SettingsGroup.invites, SettingsGroup.leaves],
        defaultValue: '{memberName} **just left.**\n🔸Was at server for **{joinedAt:duration}**.\n🔸Was invited by **{inviterName}**.\n🔸{inviterName} now at **{numInvites} invites**.',
        exampleValues: ['', ''],
        hasPremiumInfo: true
    },
    leaveMessageChannel: {
        type: 'Channel',
        grouping: [SettingsGroup.invites, SettingsGroup.leaves],
        defaultValue: null,
        exampleValues: ['#general', '#leaves']
    },
    leaderboardStyle: {
        type: 'Enum<LeaderboardStyle>',
        grouping: [SettingsGroup.invites, SettingsGroup.leaderboard],
        defaultValue: GuildSetting_1.LeaderboardStyle.normal,
        possibleValues: Object.values(GuildSetting_1.LeaderboardStyle)
    },
    hideLeftMembersFromLeaderboard: {
        type: 'Boolean',
        grouping: [SettingsGroup.invites, SettingsGroup.leaderboard],
        defaultValue: true
    },
    autoSubtractFakes: {
        type: 'Boolean',
        grouping: [SettingsGroup.invites, SettingsGroup.fakes],
        defaultValue: true
    },
    autoSubtractLeaves: {
        type: 'Boolean',
        grouping: [SettingsGroup.invites, SettingsGroup.leaves],
        defaultValue: true
    },
    autoSubtractLeaveThreshold: {
        type: 'Number' /* seconds */,
        grouping: [SettingsGroup.invites, SettingsGroup.leaves],
        defaultValue: 600,
        exampleValues: ['60', '3600']
    },
    rankAssignmentStyle: {
        type: 'Enum<RankAssignmentStyle>',
        grouping: [SettingsGroup.invites, SettingsGroup.ranks],
        defaultValue: GuildSetting_1.RankAssignmentStyle.all,
        possibleValues: Object.values(GuildSetting_1.RankAssignmentStyle)
    },
    rankAnnouncementChannel: {
        type: 'Channel',
        grouping: [SettingsGroup.invites, SettingsGroup.ranks],
        defaultValue: null,
        exampleValues: ['', '']
    },
    rankAnnouncementMessage: {
        type: 'String',
        grouping: [SettingsGroup.invites, SettingsGroup.ranks],
        defaultValue: 'Congratulations, **{memberMention}** has reached the **{rankName}** rank!',
        exampleValues: ['', ''],
        hasPremiumInfo: true
    },
    captchaVerificationOnJoin: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: false,
        hasPremiumInfo: true
    },
    captchaVerificationWelcomeMessage: {
        type: 'String',
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: 'Welcome to the server **{serverName}**! For extra protection, new members are required to enter a captcha.',
        exampleValues: ['Welcome, please enter the captcha below!'],
        hasPremiumInfo: true
    },
    captchaVerificationSuccessMessage: {
        type: 'String',
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: 'You have successfully entered the captcha. Welcome to the server!',
        exampleValues: ['Thanks for entering the captcha, enjoy our server!'],
        hasPremiumInfo: true
    },
    captchaVerificationFailedMessage: {
        type: 'String',
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: 'You did not enter the captha right within the specified time.' +
            `We're sorry, but we have to kick you from the server. Feel free to join again.`,
        exampleValues: ['Looks like you are not human :(. You can join again and try again later if this was a mistake!'],
        hasPremiumInfo: true
    },
    captchaVerificationTimeout: {
        type: 'Number' /* seconds */,
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: 180,
        exampleValues: ['60', '600'],
        hasPremiumInfo: true
    },
    captchaVerificationLogEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.captcha],
        defaultValue: true,
        hasPremiumInfo: true
    },
    autoModEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: false
    },
    autoModModeratedChannels: {
        type: 'Channel[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: [],
        exampleValues: ['#general', '#support,#help']
    },
    autoModModeratedRoles: {
        type: 'Role[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: [],
        exampleValues: ['@NewMembers', '@Newbies,@Starters']
    },
    autoModIgnoredChannels: {
        type: 'Channel[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: [],
        exampleValues: ['#general', '#off-topic,#nsfw']
    },
    autoModIgnoredRoles: {
        type: 'Role[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: [],
        exampleValues: ['@TrustedMembers', '@Moderators,@Staff']
    },
    mutedRole: {
        type: 'Role',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: null,
        exampleValues: ['@muted']
    },
    autoModDisabledForOldMembers: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: false
    },
    autoModDisabledForOldMembersThreshold: {
        type: 'Number' /* seconds */,
        grouping: [SettingsGroup.moderation, SettingsGroup.general],
        defaultValue: 604800 /* 1 week */,
        exampleValues: ['604800` (1 week)`', '2419200` (1 month)`']
    },
    autoModLogEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    modLogChannel: {
        type: 'Channel',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: null,
        exampleValues: ['#channel', '#logs']
    },
    autoModDeleteBotMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    autoModDeleteBotMessageTimeoutInSeconds: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: 5,
        exampleValues: ['5', '10']
    },
    modPunishmentBanDeleteMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    modPunishmentKickDeleteMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    modPunishmentSoftbanDeleteMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    modPunishmentWarnDeleteMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    modPunishmentMuteDeleteMessage: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.logging],
        defaultValue: true
    },
    autoModInvitesEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.invites],
        defaultValue: true
    },
    autoModLinksEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.links],
        defaultValue: true
    },
    autoModLinksWhitelist: {
        type: 'String[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.links],
        defaultValue: [],
        exampleValues: ['discordbots.org', 'youtube.com,twitch.com']
    },
    autoModLinksBlacklist: {
        type: 'String[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.links],
        defaultValue: [],
        exampleValues: ['google.com', 'twitch.com,youtube.com']
    },
    autoModLinksFollowRedirects: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.links],
        defaultValue: true,
        hasPremiumInfo: true
    },
    autoModWordsEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.bannedWords],
        defaultValue: true
    },
    autoModWordsBlacklist: {
        type: 'String[]',
        grouping: [SettingsGroup.moderation, SettingsGroup.bannedWords],
        defaultValue: [],
        exampleValues: ['gay', 'stupid,fuck']
    },
    autoModAllCapsEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.caps],
        defaultValue: true
    },
    autoModAllCapsMinCharacters: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.caps],
        defaultValue: 10,
        exampleValues: ['5', '15']
    },
    autoModAllCapsPercentageCaps: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.caps],
        defaultValue: 70,
        exampleValues: ['50', '90']
    },
    autoModDuplicateTextEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.duplicate],
        defaultValue: true
    },
    autoModDuplicateTextTimeframeInSeconds: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.duplicate],
        defaultValue: 60,
        exampleValues: ['5', '20']
    },
    autoModQuickMessagesEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.spam],
        defaultValue: true
    },
    autoModQuickMessagesNumberOfMessages: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.spam],
        defaultValue: 5,
        exampleValues: ['5', '10']
    },
    autoModQuickMessagesTimeframeInSeconds: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.spam],
        defaultValue: 3,
        exampleValues: ['2', '10']
    },
    autoModMentionUsersEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.mentions],
        defaultValue: true
    },
    autoModMentionUsersMaxNumberOfMentions: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.mentions],
        defaultValue: 5,
        exampleValues: ['2', '5']
    },
    autoModMentionRolesEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.mentions],
        defaultValue: true
    },
    autoModMentionRolesMaxNumberOfMentions: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.mentions],
        defaultValue: 3,
        exampleValues: ['2', '5']
    },
    autoModEmojisEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.emojis],
        defaultValue: true
    },
    autoModEmojisMaxNumberOfEmojis: {
        type: 'Number',
        grouping: [SettingsGroup.moderation, SettingsGroup.emojis],
        defaultValue: 5,
        exampleValues: ['5', '10']
    },
    autoModHoistEnabled: {
        type: 'Boolean',
        grouping: [SettingsGroup.moderation, SettingsGroup.emojis],
        defaultValue: true
    },
    musicVolume: {
        type: 'Number',
        grouping: [SettingsGroup.music, SettingsGroup.general],
        defaultValue: 100
    },
    announceNextSong: {
        type: 'Boolean',
        grouping: [SettingsGroup.music, SettingsGroup.announcement],
        defaultValue: true
    },
    announcementVoice: {
        type: 'Enum<AnnouncementVoice>',
        grouping: [SettingsGroup.music, SettingsGroup.announcement],
        defaultValue: GuildSetting_1.AnnouncementVoice.Joanna,
        possibleValues: Object.values(GuildSetting_1.AnnouncementVoice)
    },
    fadeMusicOnTalk: {
        type: 'Boolean',
        grouping: [SettingsGroup.music, SettingsGroup.fadeMusic],
        defaultValue: true
    },
    fadeMusicEndDelay: {
        type: 'Number',
        grouping: [SettingsGroup.music, SettingsGroup.fadeMusic],
        defaultValue: 1.0
    },
    defaultMusicPlatform: {
        type: 'Enum<MusicPlatformTypes>',
        grouping: [SettingsGroup.music, SettingsGroup.platform],
        defaultValue: types_1.MusicPlatformType.SoundCloud
    },
    disabledMusicPlatforms: {
        type: 'Enum<MusicPlatformTypes>[]',
        grouping: [SettingsGroup.music, SettingsGroup.platform],
        defaultValue: []
    }
};
exports.guildDefaultSettings = {};
Object.keys(exports.guildSettingsInfo).forEach((k) => {
    const info = exports.guildSettingsInfo[k];
    info.clearable = info.type.endsWith('[]') || info.defaultValue === null;
    exports.guildDefaultSettings[k] = exports.guildSettingsInfo[k].defaultValue;
});
exports.memberSettingsInfo = {
    [MemberSetting_1.MemberSettingsKey.hideFromLeaderboard]: {
        type: 'Boolean',
        grouping: [SettingsGroup.invites],
        defaultValue: false
    }
};
exports.memberDefaultSettings = {};
Object.keys(exports.memberSettingsInfo).forEach((k) => {
    const info = exports.memberSettingsInfo[k];
    info.clearable = info.type.endsWith('[]') || info.defaultValue === null;
    exports.memberDefaultSettings[k] = exports.memberSettingsInfo[k].defaultValue;
});
exports.inviteCodeSettingsInfo = {
    [InviteCodeSetting_1.InviteCodeSettingsKey.name]: {
        type: 'String',
        grouping: [SettingsGroup.invites],
        defaultValue: null
    },
    [InviteCodeSetting_1.InviteCodeSettingsKey.roles]: {
        type: 'Role[]',
        grouping: [SettingsGroup.invites],
        defaultValue: []
    }
};
exports.inviteCodeDefaultSettings = {};
Object.keys(exports.inviteCodeSettingsInfo).forEach((k) => {
    const info = exports.inviteCodeSettingsInfo[k];
    info.clearable = info.type.endsWith('[]') || info.defaultValue === null;
    exports.inviteCodeDefaultSettings[k] = exports.inviteCodeSettingsInfo[k].defaultValue;
});
exports.botSettingsInfo = {
    [BotSetting_1.BotSettingsKey.activityStatus]: {
        type: 'Enum<ActivityStatus>',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: BotSetting_1.ActivityStatus.online,
        possibleValues: Object.values(BotSetting_1.ActivityStatus)
    },
    [BotSetting_1.BotSettingsKey.activityEnabled]: {
        type: 'Boolean',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: true
    },
    [BotSetting_1.BotSettingsKey.activityType]: {
        type: 'Enum<ActivityType>',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: BotSetting_1.ActivityType.playing,
        possibleValues: Object.values(BotSetting_1.ActivityType)
    },
    [BotSetting_1.BotSettingsKey.activityMessage]: {
        type: 'String',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: null
    },
    [BotSetting_1.BotSettingsKey.activityUrl]: {
        type: 'String',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: null
    },
    [BotSetting_1.BotSettingsKey.embedDefaultColor]: {
        type: 'String',
        grouping: [SettingsGroup.bot, SettingsGroup.general],
        defaultValue: '#000000'
    }
};
exports.botDefaultSettings = {};
Object.keys(exports.botSettingsInfo).forEach((k) => {
    const info = exports.botSettingsInfo[k];
    info.clearable = info.type.endsWith('[]') || info.defaultValue === null;
    exports.botDefaultSettings[k] = info.defaultValue;
});
// ------------------------------------
// Functions
// ------------------------------------
function toDbValue(info, value) {
    if (value === 'default') {
        return _toDbValue(info.type, info.defaultValue);
    }
    return _toDbValue(info.type, value);
}
exports.toDbValue = toDbValue;
function _toDbValue(type, value) {
    if (value === 'none' || value === 'empty' || value === 'null' || value === null) {
        return null;
    }
    if (type === 'Channel') {
        if (typeof value === 'string') {
            return value;
        }
        else {
            return value.id;
        }
    }
    else if (type === 'Role') {
        if (typeof value === 'string') {
            return value;
        }
        else {
            return value.id;
        }
    }
    else if (type.endsWith('[]')) {
        const subType = type.substring(0, type.length - 2);
        return value && value.length > 0 ? value.map((v) => _toDbValue(subType, v)) : null;
    }
    return value;
}
function beautify(type, value) {
    if (typeof value === 'undefined' || value === null) {
        return null;
    }
    if (type.endsWith('[]')) {
        return value.map((v) => beautify(type.substring(0, type.length - 2), v)).join(' ');
    }
    switch (type) {
        case 'Boolean':
            return value ? 'True' : 'False';
        case 'Role':
            return `<@&${value}>`;
        case 'Channel':
            return `<#${value}>`;
        default:
            if (typeof value === 'string' && value.length > 1000) {
                return '`' + value.substr(0, 1000) + '`...';
            }
            return `\`${value}\``;
    }
}
exports.beautify = beautify;
//# sourceMappingURL=settings.js.map