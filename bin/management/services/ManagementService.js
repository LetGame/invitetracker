"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagementService = void 0;
const eris_1 = require("eris");
const Service_1 = require("../../framework/services/Service");
class ManagementService extends Service_1.IMService {
    async init() {
        this.client.on('messageReactionAdd', this.onMessageReactionAdd.bind(this));
        this.client.on('messageReactionRemove', this.onMessageReactionRemove.bind(this));
    }
    async onMessageReactionAdd(message, emoji, userId) {
        if (message.channel instanceof eris_1.TextChannel) {
            const reactionRoles = await this.client.cache.reactionRoles.get(message.channel.guild.id);
            const reactionRole = reactionRoles.find((role) => {
                if (role.channelId !== message.channel.id || role.messageId !== message.id) {
                    return false;
                }
                const splits = role.emoji.split(':');
                if (splits.length === 1) {
                    return emoji.name === splits[0];
                }
                else {
                    return emoji.name === splits[0] && emoji.id === splits[1];
                }
            });
            if (reactionRole) {
                await this.client.addGuildMemberRole(message.channel.guild.id, userId, reactionRole.roleId);
            }
        }
    }
    async onMessageReactionRemove(message, emoji, userId) {
        if (message.channel instanceof eris_1.TextChannel) {
            const reactionRoles = await this.client.cache.reactionRoles.get(message.channel.guild.id);
            const reactionRole = reactionRoles.find((role) => {
                if (role.channelId !== message.channel.id || role.messageId !== message.id) {
                    return false;
                }
                const splits = role.emoji.split(':');
                if (splits.length === 1) {
                    return emoji.name === splits[0];
                }
                else {
                    return emoji.name === splits[0] && emoji.id === splits[1];
                }
            });
            if (reactionRole) {
                await this.client.removeGuildMemberRole(message.channel.guild.id, userId, reactionRole.roleId);
            }
        }
    }
}
exports.ManagementService = ManagementService;
//# sourceMappingURL=ManagementService.js.map