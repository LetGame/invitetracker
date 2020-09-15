"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const Log_1 = require("../../../framework/models/Log");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const MIN = -2147483648;
const MAX = 2147483647;
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.addRank,
            aliases: ['add-rank', 'set-rank', 'setRank'],
            args: [
                {
                    name: 'role',
                    resolver: resolvers_1.RoleResolver,
                    required: true
                },
                {
                    name: 'invites',
                    resolver: new resolvers_1.NumberResolver(client, MIN, MAX),
                    required: true
                },
                {
                    name: 'info',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Ranks,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!addRank @Role 5', '!addRank "Role with space" 10 Wow, already 10 people!']
        });
    }
    async action(message, [role, invites, description], flags, { guild, t, me }) {
        await this.client.db.saveRoles([
            {
                id: role.id,
                name: role.name,
                guildId: role.guild.id,
                color: role.color.toString(16),
                createdAt: new Date(role.createdAt)
            }
        ]);
        let myRole;
        me.roles.forEach((r) => {
            const gRole = guild.roles.get(r);
            if (!myRole || gRole.position > myRole.position) {
                myRole = gRole;
            }
        });
        // Check if we are higher then the role we want to assign
        if (!myRole || myRole.position < role.position) {
            return this.sendReply(message, t('cmd.addRank.roleTooHigh', {
                role: role.name,
                myRole: myRole ? myRole.name : '<None>'
            }));
        }
        const ranks = await this.client.cache.ranks.get(guild.id);
        const rank = ranks.find((r) => r.roleId === role.id);
        const descr = description ? description : '';
        let isNew = false;
        if (rank) {
            rank.numInvites = invites;
            rank.description = descr;
            await this.client.db.saveRank(rank);
        }
        else {
            await this.client.db.saveRank({
                guildId: role.guild.id,
                roleId: role.id,
                numInvites: invites,
                description: descr
            });
            isNew = true;
        }
        await this.client.logAction(guild, message, isNew ? Log_1.LogAction.addRank : Log_1.LogAction.updateRank, {
            roleId: role.id,
            numInvites: invites,
            description
        });
        this.client.cache.ranks.flush(guild.id);
        if (!isNew) {
            return this.sendReply(message, t('cmd.addRank.updated', {
                role: `<@&${role.id}>`,
                invites,
                description
            }));
        }
        else {
            return this.sendReply(message, t('cmd.addRank.created', {
                role: `<@&${role.id}>`,
                invites,
                description
            }));
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=addRank.js.map