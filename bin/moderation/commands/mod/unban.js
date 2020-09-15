"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.unban,
            aliases: [],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.BAN_MEMBERS],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [targetUser, reason], flags, { guild, me, settings, t }) {
        const embed = this.client.mod.createBasicEmbed(targetUser);
        try {
            await guild.unbanMember(targetUser.id, encodeURIComponent(reason));
            const logEmbed = this.client.mod.createBasicEmbed(message.author);
            const usr = `${targetUser.username}#${targetUser.discriminator} ` + `(${targetUser.id})`;
            logEmbed.description += `**User**: ${usr}\n`;
            logEmbed.description += `**Action**: unban\n`;
            logEmbed.fields.push({
                name: 'Reason',
                value: reason
            });
            await this.client.logModAction(guild, logEmbed);
            embed.description = t('cmd.unban.done');
        }
        catch (error) {
            embed.description = t('cmd.unban.error', { error });
        }
        const response = await this.sendReply(message, embed);
        if (response && settings.modPunishmentBanDeleteMessage) {
            const func = () => {
                message.delete().catch(() => undefined);
                response.delete().catch(() => undefined);
            };
            setTimeout(func, 4000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=unban.js.map