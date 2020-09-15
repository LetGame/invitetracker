"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const StrikeConfig_1 = require("../../models/StrikeConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.strike,
            aliases: [],
            args: [
                {
                    name: 'member',
                    resolver: resolvers_1.MemberResolver,
                    required: true
                },
                {
                    name: 'type',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(StrikeConfig_1.ViolationType)),
                    required: true
                },
                {
                    name: 'amount',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [member, type, amount], flags, { guild, settings }) {
        const source = `${message.author.username}#${message.author.discriminator} ` + `(ID: ${message.author.id})`;
        await this.client.mod.logViolationModAction(guild, member.user, type, amount, [
            { name: 'Issued by', value: source }
        ]);
        await this.client.mod.addStrikesAndPunish(member, type, amount, {
            guild,
            settings
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=strike.js.map