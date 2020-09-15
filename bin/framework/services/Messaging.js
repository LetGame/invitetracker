"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const node_1 = require("@sentry/node");
const eris_1 = require("eris");
const i18n_1 = __importDefault(require("i18n"));
const moment_1 = __importDefault(require("moment"));
const types_1 = require("../../types");
const Service_1 = require("./Service");
const upSymbol = '🔺';
const downSymbol = '🔻';
const truthy = new Set(['true', 'on', 'y', 'yes', 'enable']);
function convertEmbedToPlain(embed) {
    const url = embed.url ? `(${embed.url})` : '';
    const authorUrl = embed.author && embed.author.url ? `(${embed.author.url})` : '';
    let fields = '';
    if (embed.fields && embed.fields.length) {
        fields = '\n\n' + embed.fields.map((f) => `**${f.name}**\n${f.value}`).join('\n\n') + '\n\n';
    }
    return ('**Embedded links are disabled for this channel.\n' +
        'Please tell an admin to enable them in the server settings.**\n\n' +
        (embed.author ? `_${embed.author.name}_ ${authorUrl}\n` : '') +
        (embed.title ? `**${embed.title}** ${url}\n` : '') +
        (embed.description ? embed.description + '\n' : '') +
        fields +
        (embed.footer ? `_${embed.footer.text}_` : ''));
}
class MessagingService extends Service_1.IMService {
    createEmbed(options = {}, overrideFooter = true) {
        let color = options.color ? options.color : parseInt('00AE86', 16);
        // Parse colors in hashtag/hex format
        if (typeof color === 'string') {
            const code = color.startsWith('#') ? color.substr(1) : color;
            color = parseInt(code, 16);
        }
        const footer = overrideFooter || !options.footer ? this.getDefaultFooter() : options.footer;
        delete options.color;
        return Object.assign(Object.assign({}, options), { type: 'rich', color,
            footer, fields: options.fields ? options.fields : [], timestamp: new Date().toISOString() });
    }
    getDefaultFooter() {
        return {
            text: this.client.user.username,
            icon_url: this.client.user.avatarURL
        };
    }
    sendReply(message, reply) {
        return this.sendEmbed(message.channel, reply, message.author);
    }
    sendEmbed(target, embed, fallbackUser) {
        const e = typeof embed === 'string' ? this.createEmbed({ description: embed }) : embed;
        e.fields = e.fields.filter((field) => field && field.value);
        const content = convertEmbedToPlain(e);
        const handleException = (err, reportIndicent = true) => {
            node_1.withScope((scope) => {
                if (target instanceof eris_1.GuildChannel) {
                    scope.setUser({ id: target.guild.id });
                    scope.setExtra('permissions', target.permissionsOf(this.client.user.id).json);
                }
                scope.setExtra('channel', target.id);
                scope.setExtra('message', embed);
                scope.setExtra('content', content);
                if (fallbackUser) {
                    scope.setExtra('fallbackUser', fallbackUser.id);
                }
                node_1.captureException(err);
            });
            if (reportIndicent && target instanceof eris_1.GuildChannel) {
                this.client.db.saveIncident(target.guild, {
                    id: null,
                    guildId: target.guild.id,
                    error: err.message,
                    details: {
                        channel: target.id,
                        embed,
                        content
                    }
                });
            }
        };
        return new Promise((resolve, reject) => {
            // Fallback functions when sending message fails
            const sendDM = async (error) => {
                if (!fallbackUser) {
                    return undefined;
                }
                try {
                    const dmChannel = await fallbackUser.getDMChannel();
                    let msg = 'I encountered an error when trying to send a message. ' +
                        `Please report this to a developer:\n\`\`\`${error ? error.message : 'Unknown'}\`\`\``;
                    if (error && error.code === 50013) {
                        const name = this.client.user.username;
                        msg =
                            `**${name} does not have permissions to post to that channel.\n` +
                                `Please allow ${name} to send messages in the <#${target.id}> channel.**\n\n`;
                    }
                    try {
                        return await dmChannel.createMessage(msg);
                    }
                    catch (err) {
                        if (err.code === 50007) {
                            // Cannot send messages to this user
                        }
                        else {
                            handleException(err, false);
                        }
                        return undefined;
                    }
                }
                catch (err2) {
                    handleException(err2, false);
                    return undefined;
                }
            };
            const sendPlain = async (error) => {
                // If we don't have permission to send messages try DM
                if (target instanceof eris_1.GuildChannel &&
                    !target.permissionsOf(this.client.user.id).has(types_1.GuildPermission.SEND_MESSAGES)) {
                    return sendDM({ code: 50013 });
                }
                try {
                    return await target.createMessage(content);
                }
                catch (err) {
                    handleException(err);
                    return sendDM(error);
                }
            };
            const send = async () => {
                // If we don't have permissions to embed links try plain content
                if (target instanceof eris_1.GuildChannel &&
                    (!target.permissionsOf(this.client.user.id).has(types_1.GuildPermission.SEND_MESSAGES) ||
                        !target.permissionsOf(this.client.user.id).has(types_1.GuildPermission.EMBED_LINKS))) {
                    return sendPlain();
                }
                try {
                    return await target.createMessage({ embed: e });
                }
                catch (err) {
                    handleException(err);
                    return sendPlain(err);
                }
            };
            resolve(send());
        });
    }
    async fillTemplate(guild, template, strings, dates) {
        let msg = template;
        if (strings) {
            Object.keys(strings).forEach((k) => (msg = msg.replace(new RegExp(`{${k}}`, 'g'), strings[k])));
        }
        if (dates) {
            Object.keys(dates).forEach((k) => (msg = this.fillDatePlaceholder(msg, k, dates[k])));
        }
        try {
            const temp = JSON.parse(msg);
            if (await this.client.cache.premium.get(guild.id)) {
                return this.createEmbed(temp, false);
            }
            else {
                const lang = (await this.client.cache.guilds.get(guild.id)).lang;
                msg += '\n\n' + i18n_1.default.__({ locale: lang, phrase: 'messages.joinLeaveEmbedsIsPremium' });
            }
        }
        catch (e) {
            //
        }
        return msg;
    }
    fillDatePlaceholder(msg, name, value) {
        const date = typeof value === 'string' ? value : value.calendar();
        const duration = typeof value === 'string' ? value : moment_1.default.duration(value.diff(moment_1.default())).humanize();
        const timeAgo = typeof value === 'string' ? value : value.fromNow();
        const calendar = typeof value === 'string' ? value : value.calendar();
        return msg
            .replace(new RegExp(`{${name}:date}`, 'g'), date)
            .replace(new RegExp(`{${name}:duration}`, 'g'), duration)
            .replace(new RegExp(`{${name}:timeAgo}`, 'g'), timeAgo)
            .replace(new RegExp(`{${name}:calendar}`, 'g'), calendar);
    }
    async prompt(message, promptStr) {
        await message.channel.createMessage(promptStr);
        let confirmation;
        const done = () => {
            if (!confirmation) {
                return [types_1.PromptResult.TIMEOUT, confirmation];
            }
            if (truthy.has(confirmation.content.toLowerCase())) {
                return [types_1.PromptResult.SUCCESS, confirmation];
            }
            return [types_1.PromptResult.FAILURE, confirmation];
        };
        return new Promise((resolve) => {
            const func = async (msg) => {
                if (msg.author.id === message.author.id) {
                    confirmation = msg;
                    this.client.removeListener('messageCreate', func);
                    resolve(done());
                }
            };
            this.client.on('messageCreate', func);
            const timeOut = () => {
                this.client.removeListener('messageCreate', func);
                resolve(done());
            };
            setTimeout(timeOut, 60000);
        });
    }
    async showPaginated(prevMsg, page, maxPage, render, author) {
        // Create embed for this page
        const embed = render(page, maxPage);
        let doPaginate = true;
        if (prevMsg.channel instanceof eris_1.GuildChannel) {
            const perm = prevMsg.channel.permissionsOf(this.client.user.id);
            if (!perm.has(types_1.GuildPermission.ADD_REACTIONS) ||
                !perm.has(types_1.GuildPermission.MANAGE_MESSAGES) ||
                !perm.has(types_1.GuildPermission.READ_MESSAGE_HISTORY)) {
                doPaginate = false;
            }
        }
        // Add page number if required
        if (page > 0 || page < maxPage - 1) {
            embed.description = embed.description + `\n\nPage ${page + 1}/${maxPage}`;
        }
        const sudo = prevMsg.__sudo;
        if (prevMsg.author.id === this.client.user.id) {
            await prevMsg.edit({ embed });
            if (!author) {
                throw new Error('Either the message of the original author must be passed, or you must explicitly specify the original author');
            }
        }
        else {
            author = prevMsg.author;
            prevMsg = await this.sendEmbed(prevMsg.channel, embed, prevMsg.author);
            // If we don't have a message we probably don't have permission
            if (!prevMsg) {
                return;
            }
        }
        // Don't paginate for sudo messages
        if (sudo) {
            return;
        }
        // Don't paginate if we don't have the permissions to add and remove reactions
        if (!doPaginate) {
            return;
        }
        if (page > 0) {
            await prevMsg.addReaction(upSymbol);
        }
        else {
            const users = await prevMsg.getReaction(upSymbol, 10).catch(() => []);
            if (users.find((u) => u.id === author.id)) {
                await prevMsg.removeReaction(upSymbol, this.client.user.id);
            }
        }
        if (page < maxPage - 1) {
            await prevMsg.addReaction(downSymbol);
        }
        else {
            const users = await prevMsg.getReaction(downSymbol, 10).catch(() => []);
            if (users.find((u) => u.id === author.id)) {
                await prevMsg.removeReaction(downSymbol, this.client.user.id);
            }
        }
        if (page > 0 || page < maxPage - 1) {
            let timer;
            const func = async (msg, emoji, userId) => {
                if (msg.id !== prevMsg.id || userId !== author.id) {
                    return;
                }
                if (emoji.name !== downSymbol && emoji.name !== upSymbol) {
                    return;
                }
                clearInterval(timer);
                this.client.removeListener('messageReactionAdd', func);
                const isUp = emoji.name === upSymbol;
                if (isUp && page > 0) {
                    await this.showPaginated(prevMsg, page - 1, maxPage, render, author);
                }
                else if (!isUp && page < maxPage) {
                    await this.showPaginated(prevMsg, page + 1, maxPage, render, author);
                }
            };
            this.client.on('messageReactionAdd', func);
            const timeOut = async () => {
                this.client.removeListener('messageReactionAdd', func);
                await prevMsg.removeReaction(upSymbol, this.client.user.id);
                await prevMsg.removeReaction(downSymbol, this.client.user.id);
            };
            timer = setTimeout(timeOut, 15000);
        }
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=Messaging.js.map