"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.lyrics,
            aliases: [],
            args: [],
            flags: [
                {
                    name: 'live',
                    short: 'l',
                    resolver: resolvers_1.BooleanResolver
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, args, { live }, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isPlaying()) {
            await this.sendReply(message, t('music.notPlaying'));
            return;
        }
        const musicPlatform = conn.getNowPlaying().getPlatform();
        if (!musicPlatform.supportsLyrics) {
            await this.sendReply(message, t('cmd.lyrics.notSupported', {
                platform: musicPlatform.getType()
            }));
            return;
        }
        const item = conn.getNowPlaying();
        const lyrics = await this.client.music.getLyrics(item);
        if (lyrics.length === 0) {
            await this.sendReply(message, t('cmd.lyrics.notFound'));
            return;
        }
        if (!live) {
            await this.sendReply(message, lyrics.map((l) => `${this.client.music.formatTime(l.start)}: ${l.text}`).join('\n'));
            return;
        }
        const index = Math.max(0, lyrics.findIndex((l) => l.start >= conn.getPlayTime()) - 1);
        const msg = await this.sendReply(message, 'Loading...');
        await this.scheduleNext(msg, conn, lyrics, index);
    }
    async scheduleNext(msg, conn, lyrics, index) {
        const now = lyrics[index];
        let text = '**' + now.text + '**\n\n';
        const last = lyrics[index - 1];
        if (last) {
            text = last.text + '\n\n' + text;
        }
        index++;
        const next = lyrics[index];
        if (next) {
            text += next.text;
            setTimeout(() => this.scheduleNext(msg, conn, lyrics, index), Math.max(0, (next.start - conn.getPlayTime()) * 1000));
        }
        else {
            setTimeout(() => msg.delete(), now.dur * 1000 + 500);
        }
        await msg.edit({
            embed: this.createEmbed({ description: text })
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=lyrics.js.map