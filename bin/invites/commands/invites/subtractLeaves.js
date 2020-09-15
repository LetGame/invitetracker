"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.subtractLeaves,
            aliases: ['subtract-leaves', 'subleaves', 'sl'],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, args, flags, { guild, t, settings }) {
        await this.client.db.subtractLeaves(guild.id, settings.autoSubtractLeaveThreshold);
        this.client.cache.invites.flush(guild.id);
        return this.sendReply(message, t('cmd.subtractLeaves.done'));
    }
}
exports.default = default_1;
//# sourceMappingURL=subtractLeaves.js.map