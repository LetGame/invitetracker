"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.fixRanks,
            aliases: ['fix-ranks'],
            args: [],
            group: types_1.CommandGroup.Ranks,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, args, flags, { guild, t }) {
        const allRoles = await guild.getRESTRoles();
        const allRanks = await this.client.cache.ranks.get(guild.id);
        const oldRoleIds = allRanks.filter((rank) => !allRoles.some((r) => r.id === rank.roleId)).map((r) => r.roleId);
        for (const roleId of oldRoleIds) {
            await this.client.db.removeRank(guild.id, roleId);
        }
        this.client.cache.ranks.flush(guild.id);
        return this.sendReply(message, t('cmd.fixRanks.done'));
    }
}
exports.default = default_1;
//# sourceMappingURL=fixRanks.js.map