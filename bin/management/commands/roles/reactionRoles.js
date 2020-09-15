"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const THUMBS_UP = '👍';
const CUSTOM_EMOJI_REGEX = /<(?:.*)?:(\w+):(\d+)>/;
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ManagementCommand.reactionRole,
            aliases: ['rr'],
            args: [
                {
                    name: 'messageId',
                    resolver: resolvers_1.StringResolver,
                    required: true
                },
                {
                    name: 'emoji',
                    resolver: resolvers_1.StringResolver,
                    required: true
                },
                {
                    name: 'role',
                    resolver: resolvers_1.RoleResolver,
                    required: false
                }
            ],
            flags: [
                {
                    name: 'remove',
                    resolver: resolvers_1.BooleanResolver,
                    short: 'r'
                }
            ],
            group: types_1.CommandGroup.Other,
            botPermissions: [types_1.GuildPermission.MANAGE_MESSAGES],
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [messageId, emoji, role], { remove }, { t, guild }) {
        const dbMessage = await this.client.db.getMessageById(guild.id, messageId);
        if (!dbMessage) {
            return this.sendReply(message, t('cmd.reactionRole.noMessageFoundInDatabase'));
        }
        const matches = emoji.match(CUSTOM_EMOJI_REGEX);
        const emojiId = matches ? `${matches[1]}:${matches[2]}` : emoji;
        if (remove) {
            await this.client.db.removeReactionRole(dbMessage.guildId, dbMessage.channelId, dbMessage.id, emojiId);
            await this.client.removeMessageReaction(dbMessage.channelId, dbMessage.id, emojiId);
        }
        else {
            const reactionRole = {
                guildId: dbMessage.guildId,
                channelId: dbMessage.channelId,
                messageId: dbMessage.id,
                roleId: role.id,
                emoji: emojiId
            };
            try {
                await this.client.addMessageReaction(dbMessage.channelId, dbMessage.id, emojiId);
                await this.client.db.saveReactionRole(reactionRole);
            }
            catch (error) {
                if (error.code === 10014) {
                    await this.sendReply(message, t('cmd.reactionRole.unknownEmoji'));
                }
                else {
                    throw error;
                }
            }
        }
        this.client.cache.reactionRoles.flush(guild.id);
        await this.client.addMessageReaction(message.channel.id, message.id, THUMBS_UP);
    }
}
exports.default = default_1;
//# sourceMappingURL=reactionRoles.js.map