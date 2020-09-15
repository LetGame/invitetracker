"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const THUMBS_UP = '👍';
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ManagementCommand.placeholder,
            aliases: ['ph'],
            args: [
                {
                    name: 'message',
                    resolver: resolvers_1.StringResolver,
                    required: false,
                    rest: true
                }
            ],
            flags: [
                {
                    name: 'edit',
                    resolver: resolvers_1.StringResolver,
                    short: 'e'
                }
            ],
            group: types_1.CommandGroup.Other,
            botPermissions: [types_1.GuildPermission.MANAGE_MESSAGES],
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [placeholder], { edit: messageId }, { t, guild }) {
        if (!messageId) {
            if (!placeholder) {
                return this.sendReply(message, t('cmd.placeholder.noMessage'));
            }
            // TODO: Premium can post embed messages
            const newMessage = await this.sendReply(message, placeholder);
            await this.client.db.saveMessage({
                guildId: guild.id,
                channelId: newMessage.channel.id,
                id: newMessage.id,
                content: newMessage.content,
                embeds: newMessage.embeds
            });
            await message.delete().catch(() => undefined);
            return;
        }
        const dbMessage = await this.client.db.getMessageById(guild.id, messageId);
        if (!dbMessage) {
            return this.sendReply(message, t('cmd.placeholder.noMessageFoundInDatabase'));
        }
        if (!placeholder) {
            // Return current message
            const msg = dbMessage.content || dbMessage.embeds[0];
            await this.sendReply(message, msg);
            return;
        }
        // Edit message
        const embed = this.createEmbed({ description: placeholder });
        const editMessage = await this.client.editMessage(dbMessage.channelId, dbMessage.id, { embed });
        await this.client.db.saveMessage({
            guildId: guild.id,
            channelId: editMessage.channel.id,
            id: editMessage.id,
            content: editMessage.content,
            embeds: editMessage.embeds
        });
        await this.client.addMessageReaction(message.channel.id, message.id, THUMBS_UP);
    }
}
exports.default = default_1;
//# sourceMappingURL=placeholder.js.map