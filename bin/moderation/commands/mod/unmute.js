"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.unmute,
            aliases: [],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.MemberResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [targetMember], flags, { guild, me, settings, t }) {
        const embed = this.client.mod.createBasicEmbed(targetMember);
        const mutedRole = settings.mutedRole;
        if (!mutedRole || !guild.roles.has(mutedRole)) {
            embed.description = t('cmd.unmute.missingRole');
        }
        else if (this.client.mod.isPunishable(guild, targetMember, message.member, me)) {
            try {
                await targetMember.removeRole(mutedRole);
                const logEmbed = this.client.mod.createBasicEmbed(targetMember);
                const usr = `${targetMember.username}#${targetMember.discriminator} ` + `(ID: ${targetMember.id})`;
                logEmbed.description += `**User**: ${usr}\n`;
                logEmbed.description += `**Action**: unmute\n`;
                logEmbed.fields.push({
                    name: 'Mod',
                    value: `<@${message.author.id}>`
                });
                await this.client.logModAction(guild, logEmbed);
                embed.description = t('cmd.unmute.done');
            }
            catch (error) {
                embed.description = t('cmd.unmute.error', { error });
            }
        }
        else {
            embed.description = t('cmd.unmute.canNotUnmute');
        }
        const response = await this.sendReply(message, embed);
        if (response && settings.modPunishmentMuteDeleteMessage) {
            const func = () => {
                message.delete().catch(() => undefined);
                response.delete().catch(() => undefined);
            };
            setTimeout(func, 4000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=unmute.js.map