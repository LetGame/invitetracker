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
            name: types_1.ModerationCommand.caseView,
            aliases: ['case-view', 'viewCase', 'view-case'],
            args: [
                {
                    name: 'caseNumber',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true,
            extraExamples: ['!caseView 5434']
        });
    }
    async action(message, [caseNumber], flags, { guild, settings, t }) {
        const embed = this.createEmbed({
            title: t('cmd.caseView.title', { id: caseNumber })
        });
        const strike = await this.client.db.getStrike(guild.id, caseNumber);
        if (strike) {
            let user = await guild
                .getRESTMember(strike.memberId)
                .then((m) => ({
                id: m.user.id,
                username: m.username,
                discriminator: m.discriminator,
                createdAt: m.createdAt,
                avatarURL: m.avatarURL
            }))
                .catch(() => undefined);
            if (!user) {
                user = {
                    id: strike.memberId,
                    username: strike.memberName,
                    discriminator: strike.memberDiscriminator,
                    createdAt: moment_1.default(strike.memberCreatedAt).valueOf(),
                    avatarURL: undefined
                };
            }
            embed.description = t('cmd.caseView.strike', {
                id: `${strike.id}`,
                amount: `**${strike.amount}**`,
                violation: `**${strike.type}**`,
                date: '**' + moment_1.default(strike.createdAt).locale(settings.lang).fromNow() + '**',
                member: `**${user.username}#${user.discriminator}** (${user.id})`
            });
        }
        else {
            embed.description = t('cmd.caseView.notFound');
        }
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=caseView.js.map