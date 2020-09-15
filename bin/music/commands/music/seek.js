"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.seek,
            aliases: [],
            args: [
                {
                    name: 'duration',
                    resolver: resolvers_1.NumberResolver,
                    rest: false
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, [duration], flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isPlaying()) {
            await this.sendReply(message, t('music.notPlaying'));
            return;
        }
        const musicPlatform = conn.getNowPlaying().getPlatform();
        if (!musicPlatform.supportsSeek) {
            await this.sendReply(message, t('cmd.seek.notSupported', {
                platform: musicPlatform.getType()
            }));
            return;
        }
        await conn.seek(duration);
    }
}
exports.default = default_1;
//# sourceMappingURL=seek.js.map