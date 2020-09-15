"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.setup,
            aliases: ['guide', 'test', 'testBot', 'test-bot'],
            group: types_1.CommandGroup.Info,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, args, flags, { t, me }) {
        const embed = this.createEmbed({
            title: t('cmd.setup.title'),
            description: t('cmd.setup.text')
        });
        // TODO: Adapt to what the server already has set
        embed.fields.push({
            name: t('cmd.setup.joinLeave.title'),
            value: t('cmd.setup.joinLeave.text')
        });
        embed.fields.push({
            name: t('cmd.setup.prefix.title'),
            value: t('cmd.setup.prefix.text')
        });
        embed.fields.push({
            name: t('cmd.setup.faq.title'),
            value: t('cmd.setup.faq.text')
        });
        embed.fields.push({
            name: t('cmd.setup.help.title'),
            value: t('cmd.setup.help.text', {
                link: this.client.config.bot.links.support
            })
        });
        embed.fields.push({
            name: t('cmd.setup.premium.title'),
            value: t('cmd.setup.premium.text', {
                link: this.client.config.bot.links.patreon
            })
        });
        if (!me.permission.has(types_1.GuildPermission.MANAGE_GUILD)) {
            embed.fields.push({
                name: t('cmd.setup.manageGuild.title'),
                value: t('cmd.setup.manageGuild.text')
            });
        }
        if (!me.permission.has(types_1.GuildPermission.MANAGE_ROLES)) {
            embed.fields.push({
                name: t('cmd.setup.manageRoles.title'),
                value: t('cmd.setup.manageRoles.text')
            });
        }
        if (!me.permission.has(types_1.GuildPermission.VIEW_AUDIT_LOGS)) {
            embed.fields.push({
                name: t('cmd.setup.viewAuditLogs.title'),
                value: t('cmd.setup.viewAuditLogs.text')
            });
        }
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=setup.js.map