"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.subtractFakes,
            aliases: ['subtract-fakes', 'subfakes', 'sf'],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, args, flags, { guild, t }) {
        const jIds = await this.client.db.getMaxJoinIdsForGuild(guild.id);
        if (jIds.length === 0) {
            return this.sendReply(message, t('cmd.subtractFakes.none'));
        }
        await this.client.db.updateJoinInvalidatedReason(`CASE WHEN id IN (${jIds.join(',')}) THEN \`invalidatedReason\` ELSE 'fake' END`, guild.id);
        this.client.cache.invites.flush(guild.id);
        return this.sendReply(message, t('cmd.subtractFakes.done'));
    }
}
exports.default = default_1;
//# sourceMappingURL=subtractFakes.js.map