"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.resume,
            aliases: ['start'],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, args, flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isConnected()) {
            await this.sendReply(message, t('music.notConnected'));
            return;
        }
        if (conn.isPaused()) {
            conn.resume();
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=resume.js.map