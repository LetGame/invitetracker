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
            name: types_1.ModerationCommand.check,
            aliases: ['history'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true,
            extraExamples: ['!check @User', '!check "User with space"']
        });
    }
    async action(message, [user], flags, { guild, settings, t }) {
        const embed = this.createEmbed({
            title: user.username
        });
        const strikeList = await this.client.db.getStrikesForMember(guild.id, user.id);
        const strikeTotal = strikeList.reduce((acc, s) => acc + s.amount, 0);
        embed.fields.push({
            name: t('cmd.check.strikes.total'),
            value: t('cmd.check.strikes.totalText', {
                amount: `**${strikeList.length}**`,
                total: `**${strikeTotal}**`
            }),
            inline: false
        });
        const punishmentList = await this.client.db.getPunishmentsForMember(guild.id, user.id);
        embed.fields.push({
            name: t('cmd.check.punishments.total'),
            value: t('cmd.check.punishments.totalText', {
                amount: `**${punishmentList.length}**`
            }),
            inline: false
        });
        const strikeText = strikeList
            .map((s) => t('cmd.check.strikes.entry', {
            id: `**${s.id}**`,
            amount: `**${s.amount}**`,
            violation: `**${s.type}**`,
            date: moment_1.default(s.createdAt).locale(settings.lang).fromNow()
        }))
            .join('\n');
        if (strikeText) {
            embed.fields.push({
                name: t('cmd.check.strikes.title'),
                value: strikeText.substr(0, 1020)
            });
        }
        const punishmentText = punishmentList
            .map((p) => t('cmd.check.punishments.entry', {
            id: `**${p.id}**`,
            punishment: `**${p.type}**`,
            amount: `**${p.amount}**`,
            date: moment_1.default(p.createdAt).locale(settings.lang).fromNow()
        }))
            .join('\n');
        if (punishmentText) {
            embed.fields.push({
                name: t('cmd.check.punishments.title'),
                value: punishmentText.substr(0, 1020)
            });
        }
        if (!punishmentText && !strikeText) {
            embed.description = t('cmd.check.noHistory');
        }
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=check.js.map