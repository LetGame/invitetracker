"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const settings_1 = require("../../../settings");
const types_1 = require("../../../types");
const GuildSetting_1 = require("../../models/GuildSetting");
const Join_1 = require("../../models/Join");
const Log_1 = require("../../models/Log");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.config,
            aliases: ['c'],
            args: [
                {
                    name: 'key',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(GuildSetting_1.GuildSettingsKey))
                },
                {
                    name: 'value',
                    resolver: new resolvers_1.SettingsValueResolver(client, settings_1.guildSettingsInfo),
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Config,
            // TODO: These are only needed if we propagate our call to "interactiveConfig"
            /*botPermissions: [
                GuildPermission.ADD_REACTIONS,
                GuildPermission.MANAGE_MESSAGES,
                GuildPermission.READ_MESSAGE_HISTORY
            ],*/
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [key, value], flags, context) {
        const { guild, settings, t } = context;
        const prefix = settings.prefix;
        const embed = this.createEmbed();
        if (!key) {
            const cmd = this.client.cmds.commands.find((c) => c.name === types_1.BotCommand.interactiveConfig);
            return cmd.action(message, [], {}, context);
        }
        const info = settings_1.guildSettingsInfo[key];
        const oldVal = settings[key];
        embed.title = key;
        if (typeof value === typeof undefined) {
            // If we have no new value, just print the old one
            // Check if the old one is set
            if (oldVal !== null) {
                embed.description = t('cmd.config.current.text', {
                    prefix,
                    key
                });
                if (info.clearable) {
                    embed.description +=
                        '\n' +
                            t('cmd.config.current.clear', {
                                prefix,
                                key
                            });
                }
                embed.fields.push({
                    name: t('cmd.config.current.title'),
                    value: settings_1.beautify(info.type, oldVal)
                });
            }
            else {
                embed.description = t('cmd.config.current.notSet', {
                    prefix,
                    key
                });
            }
            return this.sendReply(message, embed);
        }
        // If the value is null we want to clear it. Check if that's allowed.
        if (value === null) {
            if (!info.clearable) {
                return this.sendReply(message, t('cmd.config.canNotClear', { prefix, key }));
            }
        }
        else {
            // Only validate the config setting if we're not resetting or clearing it
            const error = this.validate(key, value, context);
            if (error) {
                return this.sendReply(message, error);
            }
        }
        // Set new value (we override the local value, because the formatting probably changed)
        // If the value didn't change, then it will now be equal to oldVal (and also have the same formatting)
        value = await this.client.cache.guilds.setOne(guild.id, key, value);
        if (value === oldVal) {
            embed.description = t('cmd.config.sameValue');
            embed.fields.push({
                name: t('cmd.config.current.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
            return this.sendReply(message, embed);
        }
        embed.description = t('cmd.config.changed.text', { prefix, key });
        // Log the settings change
        await this.client.logAction(guild, message, Log_1.LogAction.config, {
            key,
            oldValue: oldVal,
            newValue: value
        });
        if (oldVal !== null && oldVal !== undefined) {
            embed.fields.push({
                name: t('cmd.config.previous.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
        }
        embed.fields.push({
            name: t('cmd.config.new.title'),
            value: value !== null ? settings_1.beautify(info.type, value) : t('cmd.config.none')
        });
        // Do any post processing, such as example messages
        const cb = await this.after(message, embed, key, value, context);
        await this.sendReply(message, embed);
        if (typeof cb === typeof Function) {
            await cb();
        }
    }
    // Validate a new config value to see if it's ok (no parsing, already done beforehand)
    validate(key, value, { t, isPremium, me }) {
        if (value === null || value === undefined) {
            return null;
        }
        const info = settings_1.guildSettingsInfo[key];
        if ((info.type === 'Channel' || info.type === 'Channel[]') && key !== GuildSetting_1.GuildSettingsKey.ignoredChannels) {
            let channels = value;
            if (info.type === 'Channel') {
                channels = [value];
            }
            for (const channel of channels) {
                if (!(channel instanceof eris_1.TextChannel)) {
                    return t('cmd.config.invalid.mustBeTextChannel');
                }
                if (!channel.permissionsOf(me.id).has(types_1.GuildPermission.READ_MESSAGES)) {
                    return t('cmd.config.invalid.canNotReadMessages');
                }
                if (!channel.permissionsOf(me.id).has(types_1.GuildPermission.SEND_MESSAGES)) {
                    return t('cmd.config.invalid.canNotSendMessages');
                }
                if (!channel.permissionsOf(me.id).has(types_1.GuildPermission.EMBED_LINKS)) {
                    return t('cmd.config.invalid.canNotSendEmbeds');
                }
            }
        }
        else if (key === GuildSetting_1.GuildSettingsKey.joinRoles) {
            if (!isPremium && value && value.length > 1) {
                return t('cmd.config.invalid.multipleJoinRolesIsPremium');
            }
        }
        return null;
    }
    // Attach additional information for a config value, such as examples
    async after(message, embed, key, value, context) {
        const { guild, t, me } = context;
        const member = message.member;
        if (value && (key === GuildSetting_1.GuildSettingsKey.joinMessage || key === GuildSetting_1.GuildSettingsKey.leaveMessage)) {
            const preview = await this.client.invs.fillJoinLeaveTemplate(value, guild, member, {
                total: Math.round(Math.random() * 1000),
                regular: Math.round(Math.random() * 1000),
                custom: Math.round(Math.random() * 1000),
                fake: Math.round(Math.random() * 1000),
                leave: Math.round(Math.random() * 1000)
            }, {
                invite: {
                    code: 'tEsTcOdE',
                    channel: message.channel
                },
                inviter: me
            });
            if (typeof preview === 'string') {
                embed.fields.push({
                    name: t('cmd.config.preview.title'),
                    value: preview
                });
            }
            else {
                embed.fields.push({
                    name: t('cmd.config.preview.title'),
                    value: t('cmd.config.preview.nextMessage')
                });
                return () => this.sendReply(message, preview).catch((err) => this.sendReply(message, err.message));
            }
        }
        if (value && key === GuildSetting_1.GuildSettingsKey.rankAnnouncementMessage) {
            const preview = await this.client.msg.fillTemplate(guild, value, {
                memberId: member.id,
                memberName: member.user.username,
                memberFullName: member.user.username + '#' + member.user.discriminator,
                memberMention: `<@${member.id}> `,
                memberImage: member.user.avatarURL,
                rankMention: `<@& ${me.roles[0]}> `,
                rankName: me.roles[0]
            });
            if (typeof preview === 'string') {
                embed.fields.push({
                    name: t('cmd.config.preview.title'),
                    value: preview
                });
            }
            else {
                embed.fields.push({
                    name: t('cmd.config.preview.title'),
                    value: t('cmd.config.preview.nextMessage')
                });
                return () => this.sendReply(message, preview).catch((err) => this.sendReply(message, err.message));
            }
        }
        if (key === GuildSetting_1.GuildSettingsKey.autoSubtractFakes) {
            if (value) {
                // Subtract fake invites from all members
                const cmd = this.client.cmds.commands.find((c) => c.name === types_1.InvitesCommand.subtractFakes);
                return async () => await cmd.action(message, [], {}, context);
            }
            else {
                // Delete all fake invalidations
                await this.client.db.updateJoinInvalidatedReason(null, guild.id, {
                    invalidatedReason: Join_1.JoinInvalidatedReason.fake
                });
            }
        }
        if (key === GuildSetting_1.GuildSettingsKey.autoSubtractLeaves) {
            if (value) {
                // Subtract leaves from all members
                const cmd = this.client.cmds.commands.find((c) => c.name === types_1.InvitesCommand.subtractLeaves);
                return async () => await cmd.action(message, [], {}, context);
            }
            else {
                // Delete all leave invalidations
                await this.client.db.updateJoinInvalidatedReason(null, guild.id, {
                    invalidatedReason: Join_1.JoinInvalidatedReason.leave
                });
            }
        }
        if (key === GuildSetting_1.GuildSettingsKey.autoSubtractLeaveThreshold) {
            // Subtract leaves from all members to recompute threshold time
            const cmd = this.client.cmds.commands.find((c) => c.name === types_1.InvitesCommand.subtractLeaves);
            return async () => await cmd.action(message, [], {}, context);
        }
        if (key === GuildSetting_1.GuildSettingsKey.announcementVoice) {
            // Play sample announcement message
            if (member.voiceState && member.voiceState.channelID) {
                const channel = guild.channels.get(member.voiceState.channelID);
                const conn = await this.client.music.getMusicConnection(guild);
                await conn.playAnnouncement(value, `Hi, my name is ${value}`, channel);
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=config.js.map