"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.mashup,
            aliases: [],
            args: [
                {
                    name: 'videos',
                    resolver: resolvers_1.StringResolver,
                    required: true,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, [videos], flags, { t, guild }) {
        // TODO
        const voiceChannelId = message.member.voiceState.channelID;
        if (!voiceChannelId) {
            await this.sendReply(message, t('music.voiceChannelRequired'));
            return;
        }
        const [link1, link2] = videos.split(' ');
        if (!link2) {
            await this.sendReply(message, t('cmd.mashup.missingSecondVideo'));
            return;
        }
        const platform1 = this.client.music.platforms.getForLink(link1);
        const platform2 = this.client.music.platforms.getForLink(link2);
        const musicPlatform = this.client.music.platforms.get(types_1.MusicPlatformType.RaveDJ);
        let mashupId;
        if (platform1 &&
            platform1.getType() === types_1.MusicPlatformType.YouTube &&
            platform2 &&
            platform2.getType() === types_1.MusicPlatformType.YouTube) {
            const video1 = await platform1.getByLink(link1);
            const video2 = await platform2.getByLink(link2);
            mashupId = await musicPlatform.mix(video1.id, video2.id);
        }
        else {
            const [search1, search2] = videos.split(',');
            const youtubePlatform = this.client.music.platforms.get(types_1.MusicPlatformType.YouTube);
            const [result1] = await youtubePlatform.search(search1, 1);
            const [result2] = await youtubePlatform.search(search2, 1);
            mashupId = await musicPlatform.mix(result1.id, result2.id);
        }
        await this.sendReply(message, `RaveDJ Link: https://rave.dj/${mashupId}`);
    }
}
exports.default = default_1;
//# sourceMappingURL=mashup.js.map