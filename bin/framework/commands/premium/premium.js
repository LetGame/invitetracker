"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const types_1 = require("../../../types");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
var Action;
(function (Action) {
    Action["Check"] = "Check";
    Action["Activate"] = "Activate";
    Action["Deactivate"] = "Deactivate";
})(Action || (Action = {}));
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.premium,
            aliases: ['patreon', 'donate'],
            args: [
                {
                    name: 'action',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(Action))
                }
            ],
            group: types_1.CommandGroup.Premium,
            guildOnly: false,
            defaultAdminOnly: false,
            extraExamples: ['!premium check', '!premium activate', '!premium deactivate']
        });
    }
    async action(message, [action], flags, { guild, t, settings, isPremium }) {
        // TODO: Create list of premium features (also useful for FAQ)
        const lang = settings.lang;
        const guildId = guild ? guild.id : undefined;
        const memberId = message.author.id;
        const embed = this.createEmbed();
        const subs = await this.client.db.getPremiumSubscriptionsForMember(memberId, true);
        const guildSubs = subs ? await this.client.db.getPremiumSubscriptionGuildsForMember(memberId) : [];
        if (!action) {
            if (!subs || subs.length === 0) {
                embed.title = t('cmd.premium.noPremium.title');
                embed.description = t('cmd.premium.noPremium.text');
                embed.fields.push({
                    name: t('cmd.premium.feature.servers.title'),
                    value: t('cmd.premium.feature.servers.text')
                });
                embed.fields.push({
                    name: t('cmd.premium.feature.embeds.title'),
                    value: t('cmd.premium.feature.embeds.text', {
                        link: 'https://docs.invitemanager.co/bot/custom-messages/join-message-examples'
                    })
                });
                embed.fields.push({
                    name: t('cmd.premium.feature.export.title'),
                    value: t('cmd.premium.feature.export.text')
                });
                embed.fields.push({
                    name: t('cmd.premium.feature.patreon.title'),
                    value: t('cmd.premium.feature.patreon.text', {
                        cmd: '`' + settings.prefix + 'premium check`'
                    })
                });
            }
            else {
                embed.title = t('cmd.premium.premium.title');
                const maxDate = subs.reduce((acc, sub) => Math.max(acc, moment_1.default(sub.validUntil).unix()), 0);
                const date = moment_1.default.unix(maxDate).locale(lang).fromNow(true);
                let guildList = '';
                guildSubs.forEach((guildSub) => {
                    const guildName = guildSub.guildName;
                    guildList += `- **${guildName}**` + (guildSub.guildId === guildId ? ' *(This server)*' : '') + '\n';
                });
                if (guildId) {
                    if (guildSubs.some((s) => s.guildId === guildId)) {
                        guildList +=
                            '\n' +
                                t('cmd.premium.premium.deactivate', {
                                    cmd: `\`${settings.prefix}premium deactivate\``
                                });
                    }
                    else {
                        guildList +=
                            '\n' +
                                t('cmd.premium.premium.activate', {
                                    cmd: `\`${settings.prefix}premium activate\``
                                });
                    }
                }
                const limit = `**${guildSubs.length}/${subs.reduce((acc, sub) => Math.max(acc, sub.maxGuilds), 0)}**`;
                embed.description =
                    t('cmd.premium.premium.text', {
                        date,
                        limit,
                        guildList,
                        link: 'https://docs.invitemanager.co/bot/premium/features'
                    }) + '\n';
            }
        }
        else {
            if (action === Action.Activate) {
                embed.title = t('cmd.premium.activate.title');
                if (this.client.type === types_1.BotType.custom) {
                    embed.description = t('cmd.premium.activate.customBot');
                }
                else if (!guildId) {
                    embed.description = t('cmd.premium.activate.noGuild');
                }
                else if (isPremium) {
                    embed.description = t('cmd.premium.activate.currentlyActive');
                }
                else if (!message.member.permission.has(types_1.GuildPermission.MANAGE_GUILD)) {
                    embed.description = t('cmd.premium.activate.permissions');
                }
                else if (!subs) {
                    embed.description = t('cmd.premium.activate.noSubscription', {
                        cmd: '`' + settings.prefix + 'premium`'
                    });
                }
                else {
                    const maxGuilds = subs.reduce((acc, sub) => Math.max(acc, sub.maxGuilds), 0);
                    if (guildSubs.length >= maxGuilds) {
                        embed.description = t('cmd.premium.activate.maxGuilds');
                    }
                    else {
                        await this.client.db.savePremiumSubscriptionGuild({
                            memberId,
                            guildId
                        });
                        this.client.cache.premium.flush(guildId);
                        embed.description = t('cmd.premium.activate.done');
                    }
                }
            }
            else if (action === Action.Deactivate) {
                embed.title = t('cmd.premium.deactivate.title');
                if (this.client.type === types_1.BotType.custom) {
                    embed.description = t('cmd.premium.deactivate.customBot');
                }
                else if (!guildId) {
                    embed.description = t('cmd.premium.deactivate.noGuild');
                }
                else if (!message.member.permission.has(types_1.GuildPermission.MANAGE_GUILD)) {
                    embed.description = t('cmd.premium.deactivate.permissions');
                }
                else if (!isPremium) {
                    embed.description = t('cmd.premium.deactivate.noSubscription');
                }
                else {
                    await this.client.db.removePremiumSubscriptionGuild(memberId, guildId);
                    this.client.cache.premium.flush(guildId);
                    embed.description = t('cmd.premium.deactivate.done');
                }
            }
            else if (action === Action.Check) {
                embed.title = t('cmd.premium.check.title');
                const res = await this.client.premium.checkPatreon(memberId);
                if (res === 'not_found') {
                    embed.description = t('cmd.premium.check.notFound');
                }
                else if (res === 'declined') {
                    embed.description = t('cmd.premium.check.declined');
                }
                else if (res === 'paused') {
                    embed.description = t('cmd.premium.check.paused');
                }
                else {
                    embed.description = t('cmd.premium.check.done', {
                        valid: res.locale(lang).calendar(),
                        cmd: '`' + settings.prefix + 'premium`'
                    });
                }
            }
        }
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=premium.js.map