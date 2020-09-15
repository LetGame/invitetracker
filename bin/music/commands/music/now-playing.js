"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const PIN_UPDATE_INTERVAL = 5000;
const PREMIUM_PIN_UPDATE_INTERVAL = 2000;
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.nowPlaying,
            aliases: ['np', 'now-playing'],
            flags: [
                {
                    name: 'pin',
                    short: 'p',
                    resolver: resolvers_1.BooleanResolver
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
        this.timerMap = new Map();
    }
    async action(message, args, { pin }, { guild, t, isPremium }) {
        const conn = await this.client.music.getMusicConnection(guild);
        let item = conn.getNowPlaying();
        const embed = this.client.music.createPlayingEmbed(item);
        if (!pin && item) {
            embed.fields.push({
                name: t('cmd.nowPlaying.playTime'),
                value: item.getProgress(conn.getPlayTime())
            });
        }
        const msg = await this.sendEmbed(message.channel, embed);
        if (pin) {
            const timer = this.timerMap.get(guild.id);
            if (timer) {
                clearInterval(timer);
            }
            let msg2 = null;
            const func = async () => {
                const oldId = item ? item.id : null;
                item = conn.getNowPlaying();
                const newId = item ? item.id : null;
                if (oldId !== newId) {
                    await msg.edit({ embed: this.client.music.createPlayingEmbed(item) });
                }
                if (item) {
                    const progress = item.getProgress(conn.getPlayTime());
                    const progressEmbed = this.createEmbed({ description: progress });
                    if (msg2) {
                        await msg2.edit({ embed: progressEmbed });
                    }
                    else {
                        msg2 = await this.sendEmbed(message.channel, progressEmbed);
                    }
                }
                else {
                    if (msg2) {
                        await msg2.delete().catch(() => undefined);
                        msg2 = null;
                    }
                }
            };
            const interval = isPremium ? PREMIUM_PIN_UPDATE_INTERVAL : PIN_UPDATE_INTERVAL;
            await func();
            this.timerMap.set(guild.id, setInterval(func, interval));
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=now-playing.js.map