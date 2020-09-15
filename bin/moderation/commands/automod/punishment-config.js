"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const PunishmentConfig_1 = require("../../models/PunishmentConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.punishmentConfig,
            aliases: ['punishment-config'],
            args: [
                {
                    name: 'punishment',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(PunishmentConfig_1.PunishmentType))
                },
                {
                    name: 'strikes',
                    resolver: resolvers_1.NumberResolver
                },
                {
                    name: 'args',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [punishmentType, strikes, args], flags, { guild, t }) {
        const embed = this.createEmbed({
            title: t('cmd.punishmentConfig.title')
        });
        const punishmentConfigList = await this.client.cache.punishments.get(guild.id);
        if (typeof punishmentType === typeof undefined) {
            const allPunishments = Object.values(PunishmentConfig_1.PunishmentType);
            const unusedPunishment = allPunishments.filter((p) => punishmentConfigList.map((pcl) => pcl.type).indexOf(p) < 0);
            embed.description = punishmentConfigList
                .map((pcl) => t('cmd.punishmentConfig.text', {
                punishment: `**${pcl.type}**`,
                strikes: `**${pcl.amount}**`
            }))
                .join('\n');
            embed.fields.push({
                name: t('cmd.punishmentConfig.unusedPunishment'),
                value: `\n${unusedPunishment.map((v) => `\`${v}\``).join(', ')}`
            });
        }
        else if (typeof strikes === typeof undefined) {
            const pc = punishmentConfigList.find((c) => c.type === punishmentType);
            embed.description = t('cmd.punishmentConfig.text', {
                punishment: `**${pc ? pc.type : punishmentType}**`,
                strikes: `**${pc ? pc.amount : 0}**`
            });
        }
        else if (strikes === 0) {
            await this.client.db.removePunishmentConfig(guild.id, punishmentType);
            embed.description = t('cmd.punishmentConfig.deletedText', {
                punishment: `**${punishmentType}**`
            });
        }
        else {
            await this.client.db.savePunishmentConfig({
                guildId: guild.id,
                type: punishmentType,
                amount: strikes,
                args: args
            });
            embed.description = t('cmd.punishmentConfig.text', {
                punishment: `**${punishmentType}**`,
                strikes: `**${strikes}**`
            });
        }
        this.client.cache.punishments.flush(guild.id);
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=punishment-config.js.map