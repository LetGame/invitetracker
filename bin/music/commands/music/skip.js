"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.skip,
            aliases: ['next'],
            args: [
                {
                    name: 'amount',
                    required: false,
                    resolver: new resolvers_1.NumberResolver(client, 1)
                }
            ],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, [amount], flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        if (!conn.isPlaying()) {
            await this.sendReply(message, t('music.notPlaying'));
            return;
        }
        await conn.skip(amount || 0);
    }
}
exports.default = default_1;
//# sourceMappingURL=skip.js.map