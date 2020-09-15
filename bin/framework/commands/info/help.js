"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.help,
            aliases: [],
            args: [
                {
                    name: 'command',
                    resolver: resolvers_1.CommandResolver
                }
            ],
            group: types_1.CommandGroup.Info,
            guildOnly: false,
            defaultAdminOnly: false,
            extraExamples: ['!help addRank']
        });
    }
    async action(message, [command], flags, context) {
        const { guild, t, settings, me } = context;
        const embed = this.createEmbed();
        const prefix = settings ? settings.prefix : '!';
        if (command) {
            const cmd = Object.assign(Object.assign({}, command), { usage: command.usage.replace('{prefix}', prefix), info: command.getInfo(context).substr(0, 900) });
            embed.fields.push({
                name: t('cmd.help.command.title'),
                value: cmd.name,
                inline: true
            });
            embed.fields.push({
                name: t('cmd.help.description.title'),
                value: t(`cmd.${cmd.name}.self.description`),
                inline: true
            });
            embed.fields.push({
                name: t('cmd.help.usage.title'),
                value: '`' + cmd.usage + '`\n\n' + cmd.info
            });
            if (cmd.aliases.length > 0) {
                embed.fields.push({
                    name: t('cmd.help.aliases.title'),
                    value: cmd.aliases.join(', '),
                    inline: true
                });
            }
        }
        else {
            embed.description = t('cmd.help.text', { prefix }) + '\n\n';
            const commands = this.client.cmds.commands
                .map((c) => (Object.assign(Object.assign({}, c), { usage: c.usage.replace('{prefix}', prefix) })))
                .sort((a, b) => a.name.localeCompare(b.name));
            Object.keys(types_1.CommandGroup).forEach((group) => {
                const cmds = commands.filter((c) => c.group === group);
                if (cmds.length === 0) {
                    return;
                }
                let descr = '';
                descr += cmds.map((c) => '`' + c.name + '`').join(', ');
                embed.fields.push({ name: group, value: descr });
            });
            if (guild) {
                let member = guild.members.get(message.author.id);
                if (!member) {
                    member = await guild.getRESTMember(message.author.id);
                }
                if (member && member.permission.has(types_1.GuildPermission.ADMINISTRATOR)) {
                    const missing = [];
                    if (!me.permission.has(types_1.GuildPermission.MANAGE_GUILD)) {
                        missing.push(t('permissions.manageGuild'));
                    }
                    if (!me.permission.has(types_1.GuildPermission.VIEW_AUDIT_LOGS)) {
                        missing.push(t('permissions.viewAuditLogs'));
                    }
                    if (!me.permission.has(types_1.GuildPermission.MANAGE_ROLES)) {
                        missing.push(t('permissions.manageRoles'));
                    }
                    if (missing.length > 0) {
                        embed.fields.push({
                            name: t('cmd.help.missingPermissions'),
                            value: missing.map((p) => `\`${p}\``).join(', ')
                        });
                    }
                }
            }
        }
        const linksArray = [];
        if (this.client.config.bot.links.support) {
            linksArray.push(`[${t('bot.supportDiscord.title')}](${this.client.config.bot.links.support})`);
        }
        if (this.client.config.bot.links.add) {
            linksArray.push(`[${t('bot.invite.title')}](${this.client.config.bot.links.add})`);
        }
        if (this.client.config.bot.links.website) {
            linksArray.push(`[${t('bot.website.title')}](${this.client.config.bot.links.website})`);
        }
        if (this.client.config.bot.links.patreon) {
            linksArray.push(`[${t('bot.patreon.title')}](${this.client.config.bot.links.patreon})`);
        }
        embed.fields.push({
            name: t('cmd.help.links'),
            value: linksArray.join(` | `)
        });
        await this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=help.js.map