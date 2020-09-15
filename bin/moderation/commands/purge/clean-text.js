"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.cleanText,
            aliases: ['clean-text', 'clearText', 'clear-text'],
            args: [
                {
                    name: 'text',
                    resolver: resolvers_1.StringResolver,
                    required: true
                },
                {
                    name: 'numberOfMessages',
                    resolver: resolvers_1.NumberResolver
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.READ_MESSAGE_HISTORY, types_1.GuildPermission.MANAGE_MESSAGES],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [text, numberOfMessages], flags, { guild, t }) {
        const embed = this.createEmbed();
        if (numberOfMessages < 1) {
            return this.sendReply(message, t('cmd.clean.invalidQuantity'));
        }
        if (numberOfMessages === undefined) {
            numberOfMessages = 5;
        }
        const messages = await message.channel.getMessages(Math.min(numberOfMessages, 100), message.id);
        const searchStrings = text.split('+');
        const messagesToBeDeleted = messages.filter((msg) => {
            return searchStrings.some((s) => msg.content.includes(s));
        });
        messagesToBeDeleted.push(message);
        try {
            await this.client.deleteMessages(message.channel.id, messagesToBeDeleted.map((m) => m.id));
            embed.title = t('cmd.clean.title');
            embed.description = t('cmd.clean.text', {
                amount: `**${messagesToBeDeleted.length}**`
            });
        }
        catch (error) {
            embed.title = t('cmd.clean.error');
            embed.description = error;
        }
        const response = await this.sendReply(message, embed);
        if (response) {
            const func = () => response.delete().catch(() => undefined);
            setTimeout(func, 5000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=clean-text.js.map