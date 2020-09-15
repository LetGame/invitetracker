"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const Log_1 = require("../../../framework/models/Log");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.removeRank,
            aliases: ['remove-rank'],
            args: [
                {
                    name: 'rank',
                    resolver: resolvers_1.RoleResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Ranks,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!removeRank @Role', '!removeRank "Role with space"']
        });
    }
    async action(message, [role], flags, { guild, t }) {
        const ranks = await this.client.cache.ranks.get(guild.id);
        const rank = ranks.find((r) => r.roleId === role.id);
        if (rank) {
            await this.client.db.removeRank(guild.id, rank.roleId);
            await this.client.logAction(guild, message, Log_1.LogAction.removeRank, {
                roleId: role.id
            });
            this.client.cache.ranks.flush(guild.id);
            return this.sendReply(message, t('cmd.removeRank.done', { role: `<@&${role.id}>` }));
        }
        else {
            return this.sendReply(message, t('cmd.removeRank.rankNotFound', { role: `<@&${role.id}>` }));
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=removeRank.js.map