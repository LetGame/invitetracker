"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.volume,
            aliases: [],
            args: [
                {
                    name: 'volume',
                    resolver: new resolvers_1.NumberResolver(client, 0, 1000)
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, [volume], flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isPlaying()) {
            await this.sendReply(message, t('music.notPlaying'));
            return;
        }
        if (volume) {
            conn.setVolume(volume);
            await this.sendReply(message, `Changed volume to ${volume}`);
        }
        else {
            await this.sendReply(message, `Volume is set to ${conn.getVolume()}`);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=volume.js.map