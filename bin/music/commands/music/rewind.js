"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.rewind,
            aliases: ['replay'],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, args, flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isPlaying()) {
            await this.sendReply(message, t('music.notPlaying'));
            return;
        }
        const musicPlatform = conn.getNowPlaying().getPlatform();
        if (!musicPlatform.supportsRewind) {
            await this.sendReply(message, t('cmd.rewind.notSupported', { platform: musicPlatform.getType() }));
            return;
        }
        await conn.rewind();
    }
}
exports.default = default_1;
//# sourceMappingURL=rewind.js.map