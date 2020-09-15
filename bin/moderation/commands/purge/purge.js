"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.purge,
            aliases: ['prune'],
            args: [
                {
                    name: 'quantity',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                },
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.READ_MESSAGE_HISTORY, types_1.GuildPermission.MANAGE_MESSAGES],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [quantity, user], flags, { guild, t }) {
        const embed = this.createEmbed();
        if (quantity < 1) {
            return this.sendReply(message, t('cmd.purge.invalidQuantity'));
        }
        let messages;
        if (user) {
            messages = (await message.channel.getMessages(Math.min(quantity, 100), message.id)).filter((a) => a.author && a.author.id === user.id);
        }
        else {
            messages = await message.channel.getMessages(Math.min(quantity, 100), message.id);
        }
        messages.push(message);
        try {
            await this.client.deleteMessages(message.channel.id, messages.map((m) => m.id), 'purge command');
            embed.title = t('cmd.purge.title');
            embed.description = t('cmd.purge.text', {
                amount: `**${messages.length}**`
            });
        }
        catch (error) {
            embed.title = t('cmd.purge.error');
            embed.description = error.message;
        }
        const response = await this.sendReply(message, embed);
        if (response) {
            const func = () => response.delete().catch(() => undefined);
            setTimeout(func, 5000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=purge.js.map