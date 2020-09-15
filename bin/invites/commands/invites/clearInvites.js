"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const Log_1 = require("../../../framework/models/Log");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.clearInvites,
            aliases: ['clear-invites'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                }
            ],
            flags: [
                {
                    name: 'date',
                    resolver: resolvers_1.DateResolver,
                    short: 'd'
                },
                {
                    name: 'clearBonus',
                    resolver: resolvers_1.BooleanResolver,
                    short: 'cb'
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!clearInvites @User', '!clearInvites -cb "User with space"']
        });
    }
    async action(message, [user], { date, clearBonus }, { guild, t }) {
        const memberId = user ? user.id : undefined;
        await this.client.db.updateInviteCodeClearedAmount('uses', guild.id, memberId);
        const codes = memberId ? await this.client.db.getInviteCodesForMember(guild.id, memberId) : [];
        await this.client.db.updateJoinClearedStatus(true, guild.id, codes.map((ic) => ic.code));
        if (clearBonus) {
            // Clear invites
            await this.client.db.clearCustomInvites(true, guild.id, memberId);
        }
        else {
            await this.client.db.clearCustomInvites(false, guild.id, memberId);
        }
        if (memberId) {
            this.client.cache.invites.flushOne(guild.id, memberId);
        }
        else {
            this.client.cache.invites.flush(guild.id);
        }
        await this.client.logAction(guild, message, Log_1.LogAction.clearInvites, Object.assign({ clearBonus }, (memberId && { targetId: memberId })));
        return this.sendReply(message, t('cmd.clearInvites.done'));
    }
}
exports.default = default_1;
//# sourceMappingURL=clearInvites.js.map