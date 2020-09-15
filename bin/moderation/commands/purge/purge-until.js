"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.purgeUntil,
            aliases: ['purge-until', 'prune-until', 'pruneu', 'purgeu'],
            args: [
                {
                    name: 'messageID',
                    resolver: resolvers_1.StringResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.READ_MESSAGE_HISTORY, types_1.GuildPermission.MANAGE_MESSAGES],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [untilMessageID], flags, { guild, t }) {
        const embed = this.createEmbed({
            title: t('cmd.purgeUntil.title'),
            description: t('cmd.purgeUntil.inProgress')
        });
        const response = await this.sendReply(message, embed);
        let amount = 0;
        let messages;
        while (!messages || messages.length > 1) {
            messages = await message.channel.getMessages(1000, undefined, untilMessageID);
            try {
                await this.client.deleteMessages(message.channel.id, messages.filter((m) => m.id !== response.id).map((m) => m.id));
                amount += messages.length;
            }
            catch (_a) {
                break;
            }
        }
        embed.description = t('cmd.purgeUntil.text', {
            amount: `**${amount}**`
        });
        await response.edit({ embed });
        const func = () => response.delete().catch(() => undefined);
        setTimeout(func, 5000);
    }
}
exports.default = default_1;
//# sourceMappingURL=purge-until.js.map