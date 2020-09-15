"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.caseDelete,
            aliases: ['case-delete', 'deleteCase', 'delete-case'],
            args: [
                {
                    name: 'caseNumber',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true,
            extraExamples: ['!caseDelete 5434 User apologized']
        });
    }
    async action(message, [caseNumber], flags, { guild, t }) {
        const embed = this.createEmbed({
            title: t('cmd.caseDelete.title', {
                number: caseNumber
            })
        });
        const strike = await this.client.db.getStrike(guild.id, caseNumber);
        if (strike) {
            await this.client.db.removeStrike(strike.guildId, strike.id);
            embed.description = t('cmd.caseDelete.done', {
                id: `${strike.id}`
            });
        }
        else {
            embed.description = t('cmd.caseDelete.notFound');
        }
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=caseDelete.js.map