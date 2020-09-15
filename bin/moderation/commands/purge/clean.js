"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
var CleanType;
(function (CleanType) {
    CleanType["images"] = "images";
    CleanType["links"] = "links";
    CleanType["mentions"] = "mentions";
    CleanType["bots"] = "bots";
    CleanType["embeds"] = "embeds";
    CleanType["emojis"] = "emojis";
    CleanType["reacted"] = "reacted";
    CleanType["reactions"] = "reactions";
})(CleanType || (CleanType = {}));
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.clean,
            aliases: ['clear'],
            args: [
                {
                    name: 'type',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(CleanType)),
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
        this.cleanFunctions = {
            [CleanType.images]: this.images.bind(this),
            [CleanType.links]: this.links.bind(this),
            [CleanType.mentions]: this.mentions.bind(this),
            [CleanType.bots]: this.bots.bind(this),
            [CleanType.embeds]: this.embeds.bind(this),
            [CleanType.emojis]: this.emojis.bind(this),
            [CleanType.reacted]: this.reacted.bind(this),
            [CleanType.reactions]: this.reacted.bind(this)
        };
    }
    async action(message, [type, numberOfMessages], flags, { guild, t }) {
        const embed = this.createEmbed();
        if (numberOfMessages < 1) {
            return this.sendReply(message, t('cmd.clean.invalidQuantity'));
        }
        if (numberOfMessages === undefined) {
            numberOfMessages = 5;
        }
        const messages = await message.channel.getMessages(Math.min(numberOfMessages, 100), message.id);
        const messagesToBeDeleted = this.cleanFunctions[type](messages);
        if (type === CleanType.reactions) {
            for (const messageToBeDeleted of messagesToBeDeleted) {
                await messageToBeDeleted.removeReactions().catch(() => undefined);
            }
            message.delete().catch(() => undefined);
            embed.title = t('cmd.clean.title');
            embed.description = t('cmd.clean.textReactions', {
                amount: `**${messagesToBeDeleted.length}**`
            });
        }
        else {
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
                embed.description = error.message;
            }
        }
        const response = await this.sendReply(message, embed);
        if (response) {
            const func = () => response.delete().catch(() => undefined);
            setTimeout(func, 5000);
        }
    }
    images(messages) {
        return messages.filter((message) => {
            return message.attachments.length > 0;
        });
    }
    links(messages) {
        return messages.filter((message) => {
            const matches = this.client.mod.getLinks(message);
            return matches && matches.length > 0;
        });
    }
    mentions(messages) {
        return messages.filter((message) => {
            return message.mentionEveryone || message.mentions.length > 0 || message.roleMentions.length > 0;
        });
    }
    bots(messages) {
        return messages.filter((message) => {
            return message.author.bot;
        });
    }
    embeds(messages) {
        return messages.filter((message) => {
            return message.embeds.length > 0;
        });
    }
    emojis(messages) {
        return messages.filter((message) => {
            return this.client.mod.countEmojis(message) > 0;
        });
    }
    reacted(messages) {
        return messages.filter((message) => {
            const reactionsKeys = Object.keys(message.reactions);
            return reactionsKeys.length > 0;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=clean.js.map