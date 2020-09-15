"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsValueResolver = void 0;
const types_1 = require("../../types");
const BotSetting_1 = require("../models/BotSetting");
const GuildSetting_1 = require("../models/GuildSetting");
const _1 = require(".");
class SettingsValueResolver extends _1.Resolver {
    constructor(client, infos) {
        super(client);
        this.infos = infos;
        this.resolvers = {
            Channel: new _1.ChannelResolver(client),
            'Channel[]': new _1.ArrayResolver(client, _1.ChannelResolver),
            Boolean: new _1.BooleanResolver(client),
            Number: new _1.NumberResolver(client),
            Date: new _1.DateResolver(client),
            Role: new _1.RoleResolver(client),
            'Role[]': new _1.ArrayResolver(client, _1.RoleResolver),
            String: new _1.StringResolver(client),
            'String[]': new _1.ArrayResolver(client, _1.StringResolver),
            'Enum<Lang>': new _1.EnumResolver(client, Object.values(GuildSetting_1.Lang)),
            'Enum<LeaderboardStyle>': new _1.EnumResolver(client, Object.values(GuildSetting_1.LeaderboardStyle)),
            'Enum<RankAssignmentStyle>': new _1.EnumResolver(client, Object.values(GuildSetting_1.RankAssignmentStyle)),
            'Enum<AnnouncementVoice>': new _1.EnumResolver(client, Object.values(GuildSetting_1.AnnouncementVoice)),
            'Enum<ActivityType>': new _1.EnumResolver(client, Object.values(BotSetting_1.ActivityType)),
            'Enum<ActivityStatus>': new _1.EnumResolver(client, Object.values(BotSetting_1.ActivityStatus)),
            'Enum<MusicPlatformTypes>': new _1.EnumResolver(client, Object.values(types_1.MusicPlatformType)),
            'Enum<MusicPlatformTypes>[]': new _1.ArrayResolver(client, new _1.EnumResolver(client, Object.values(types_1.MusicPlatformType)))
        };
    }
    resolve(value, context, [key]) {
        if (typeof value === typeof undefined || value.length === 0) {
            return;
        }
        if (value === 'none' || value === 'empty' || value === 'null') {
            return null;
        }
        if (value === 'default') {
            return this.infos[key].defaultValue;
        }
        const resolver = this.resolvers[this.infos[key].type];
        return resolver.resolve(value, context, [key]);
    }
    getHelp(context, args) {
        if (args && args.length > 0) {
            const key = args[0];
            return this.resolvers[this.infos[key].type].getHelp(context, [key]);
        }
        return super.getHelp(context);
    }
}
exports.SettingsValueResolver = SettingsValueResolver;
//# sourceMappingURL=SettingsValueResolver.js.map