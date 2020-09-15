"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.botInfo,
            aliases: ['bot-info'],
            group: types_1.CommandGroup.Info,
            defaultAdminOnly: false,
            guildOnly: true
        });
    }
    async action(message, args, flags, { t, guild, settings, isPremium }) {
        const lang = settings.lang;
        const embed = this.createEmbed();
        // Version
        embed.fields.push({
            name: t('cmd.botInfo.version'),
            value: this.client.version,
            inline: true
        });
        // Uptime
        embed.fields.push({
            name: t('cmd.botInfo.uptime'),
            value: moment_1.default.duration(moment_1.default().diff(this.client.startedAt)).locale(lang).humanize(),
            inline: true
        });
        // Shard info
        embed.fields.push({
            name: t('cmd.botInfo.shards.current'),
            value: `${this.client.shardId} (${this.client.db.getDbShardForGuild(guild.id)})`,
            inline: true
        });
        // Premium
        embed.fields.push({
            name: t('cmd.botInfo.premium.title'),
            value: this.client.type === types_1.BotType.custom
                ? '**' + t('cmd.botInfo.premium.custom') + '**'
                : isPremium
                    ? t('cmd.botInfo.premium.active')
                    : t('cmd.botInfo.premium.none')
        });
        // Support discord
        if (this.client.config.bot.links.support) {
            embed.fields.push({
                name: t('bot.supportDiscord.title'),
                value: this.client.config.bot.links.support
            });
        }
        // Add bot
        if (this.client.config.bot.links.add) {
            embed.fields.push({
                name: t('bot.invite.title'),
                value: this.client.config.bot.links.add
            });
        }
        // Bot website
        if (this.client.config.bot.links.website) {
            embed.fields.push({
                name: t('bot.website.title'),
                value: this.client.config.bot.links.website
            });
        }
        // Patreon
        if (this.client.config.bot.links.patreon) {
            embed.fields.push({
                name: t('bot.patreon.title'),
                value: this.client.config.bot.links.patreon
            });
        }
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=botInfo.js.map