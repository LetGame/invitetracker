"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.play,
            aliases: ['p'],
            args: [
                {
                    name: 'link',
                    resolver: resolvers_1.StringResolver,
                    required: true,
                    rest: true
                }
            ],
            flags: [
                {
                    name: 'platform',
                    short: 'p',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(types_1.MusicPlatformType))
                },
                {
                    name: 'next',
                    short: 'n',
                    resolver: resolvers_1.BooleanResolver
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, [link], { platform, next }, { t, guild, settings }) {
        const voiceChannelId = message.member.voiceState.channelID;
        if (!voiceChannelId) {
            await this.sendReply(message, t('music.voiceChannelRequired'));
            return;
        }
        const conn = await this.client.music.getMusicConnection(guild);
        if (!link) {
            if (conn.isPaused()) {
                conn.resume();
            }
            return;
        }
        let musicPlatform;
        if (platform) {
            musicPlatform = this.client.music.platforms.get(platform);
        }
        else {
            musicPlatform = this.client.music.platforms.getForLink(link);
        }
        let item;
        if (musicPlatform) {
            item = await musicPlatform.getByLink(link);
        }
        else {
            musicPlatform = this.client.music.platforms.get(settings.defaultMusicPlatform);
            const items = await musicPlatform.search(link, 1);
            if (items.length > 0) {
                item = items[0];
            }
        }
        if (item) {
            item.setAuthor(message.author);
            const voiceChannel = guild.channels.get(voiceChannelId);
            await conn.play(item, voiceChannel, next);
            await this.sendEmbed(message.channel, this.client.music.createPlayingEmbed(item));
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=play.js.map