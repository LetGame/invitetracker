"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.ping,
            aliases: [],
            group: types_1.CommandGroup.Info,
            defaultAdminOnly: false,
            guildOnly: false
        });
    }
    async action(message, args, flags, context) {
        const msg = await message.channel.createMessage('Pong!').catch(() => undefined);
        if (msg) {
            msg.edit(`Pong! (${(msg.createdAt - message.createdAt).toFixed(0)}ms)`);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=ping.js.map