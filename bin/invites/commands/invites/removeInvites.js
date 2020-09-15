"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.removeInvites,
            aliases: ['remove-invites'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver,
                    required: true
                },
                {
                    name: 'amount',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: [
                '!removeInvites @User 5',
                '!removeInvites "User with space" 23 Removed for cheating',
                '!removeInvites @User -6 Added for apologizing'
            ]
        });
    }
    async action(message, [user, amount, reason], flags, context) {
        const cmd = this.client.cmds.commands.find((c) => c.name === types_1.InvitesCommand.addInvites);
        return cmd.action(message, [user, -amount, reason], flags, context);
    }
}
exports.default = default_1;
//# sourceMappingURL=removeInvites.js.map