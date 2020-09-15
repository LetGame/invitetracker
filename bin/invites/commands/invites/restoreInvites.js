"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const Log_1 = require("../../../framework/models/Log");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.restoreInvites,
            aliases: ['restore-invites', 'unclear-invites', 'unclearInvites'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!restoreInvites @User', '!restoreInvites "User with space"']
        });
    }
    async action(message, [user], flags, { guild, t }) {
        const memberId = user ? user.id : null;
        await this.client.db.updateInviteCodeClearedAmount(0, guild.id, memberId);
        const codes = memberId ? await this.client.db.getInviteCodesForMember(guild.id, memberId) : [];
        await this.client.db.updateJoinClearedStatus(false, guild.id, codes.map((ic) => ic.code));
        await this.client.db.clearCustomInvites(false, guild.id, memberId);
        if (memberId) {
            this.client.cache.invites.flushOne(guild.id, memberId);
        }
        else {
            this.client.cache.invites.flush(guild.id);
        }
        await this.client.logAction(guild, message, Log_1.LogAction.restoreInvites, Object.assign({}, (memberId && { targetId: memberId })));
        return this.sendReply(message, t('cmd.restoreInvites.done'));
    }
}
exports.default = default_1;
//# sourceMappingURL=restoreInvites.js.map