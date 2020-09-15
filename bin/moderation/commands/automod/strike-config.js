"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const StrikeConfig_1 = require("../../models/StrikeConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.strikeConfig,
            aliases: ['strike-config'],
            args: [
                {
                    name: 'violation',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(StrikeConfig_1.ViolationType))
                },
                {
                    name: 'strikes',
                    resolver: resolvers_1.NumberResolver
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [violationType, strikes], flags, { guild, t }) {
        const embed = this.createEmbed({
            title: t('cmd.strikeConfig.title')
        });
        const strikeConfigList = await this.client.cache.strikes.get(guild.id);
        if (typeof violationType === typeof undefined) {
            const allViolations = Object.values(StrikeConfig_1.ViolationType);
            const unusedViolations = allViolations.filter((v) => strikeConfigList.map((scl) => scl.type).indexOf(v) < 0);
            embed.description = strikeConfigList
                .map((scl) => t('cmd.strikeConfig.text', {
                violation: `**${scl.type}**`,
                strikes: `**${scl.amount}**`
            }))
                .join('\n');
            embed.fields.push({
                name: t('cmd.strikeConfig.unusedViolations'),
                value: `\n${unusedViolations.map((v) => `\`${v}\``).join(', ')}`
            });
        }
        else if (typeof strikes === typeof undefined) {
            const strike = strikeConfigList.find((c) => c.type === violationType);
            embed.description = t('cmd.strikeConfig.text', {
                violation: `**${strike ? strike.type : violationType}**`,
                strikes: `**${strike ? strike.amount : 0}**`
            });
        }
        else if (strikes === 0) {
            await this.client.db.removeStrikeConfig(guild.id, violationType);
            embed.description = t('cmd.strikeConfig.deletedText', {
                violation: `**${violationType}**`
            });
        }
        else {
            await this.client.db.saveStrikeConfig({
                guildId: guild.id,
                type: violationType,
                amount: strikes
            });
            embed.description = t('cmd.strikeConfig.text', {
                violation: `**${violationType}**`,
                strikes: `**${strikes}**`
            });
            // TODO: expiration
        }
        this.client.cache.strikes.flush(guild.id);
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=strike-config.js.map