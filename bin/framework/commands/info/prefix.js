"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.prefix,
            aliases: [],
            group: types_1.CommandGroup.Info,
            defaultAdminOnly: false,
            guildOnly: true
        });
    }
    async action(message, args, flags, { settings, t }) {
        return this.sendReply(message, t('cmd.prefix.title', {
            prefix: settings.prefix
        }));
    }
}
exports.default = default_1;
//# sourceMappingURL=prefix.js.map