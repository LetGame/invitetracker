"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.support,
            aliases: [],
            group: types_1.CommandGroup.Info,
            defaultAdminOnly: false,
            guildOnly: false
        });
    }
    async action(message, args, flags, { t }) {
        const embed = this.createEmbed();
        embed.fields.push({
            name: t('cmd.support.server'),
            value: `"https://discord.gg/x5gmedV`
        });
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=support.js.map