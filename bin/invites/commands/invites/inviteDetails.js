"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.inviteDetails,
            aliases: ['invite-details'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!inviteDetails @User', '!inviteDetails "User with space"']
        });
    }
    async action(message, [user], flags, { guild, t, settings }) {
        const target = user ? user : message.author;
        const invs = await this.client.db.getInviteCodesForMember(guild.id, target.id);
        if (invs.length === 0) {
            await this.sendReply(message, t('cmd.inviteDetails.noInviteCodes'));
            return;
        }
        const lang = settings.lang;
        const allSets = await this.client.cache.inviteCodes.get(guild.id);
        let invText = '';
        for (const inv of invs.slice(0, 25)) {
            const sets = allSets.get(inv.code);
            const name = sets && sets.name ? `**${sets.name}** (${inv.code})` : `**${inv.code}**`;
            invText +=
                t('cmd.inviteDetails.entry', {
                    uses: inv.uses,
                    code: name,
                    createdAt: moment_1.default(inv.createdAt).locale(lang).fromNow()
                }) + '\n';
        }
        await this.sendReply(message, invText);
    }
}
exports.default = default_1;
//# sourceMappingURL=inviteDetails.js.map