"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../../../settings");
const types_1 = require("../../../types");
const Log_1 = require("../../models/Log");
const MemberSetting_1 = require("../../models/MemberSetting");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.memberConfig,
            aliases: ['member-config', 'memconf', 'mc'],
            args: [
                {
                    name: 'key',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(MemberSetting_1.MemberSettingsKey))
                },
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                },
                {
                    name: 'value',
                    resolver: new resolvers_1.SettingsValueResolver(client, settings_1.memberSettingsInfo),
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Config,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [key, user, value], flags, context) {
        const { guild, t, settings } = context;
        const prefix = settings.prefix;
        const embed = this.createEmbed();
        if (!key) {
            embed.title = t('cmd.memberConfig.title');
            embed.description = t('cmd.memberConfig.text', { prefix });
            const keys = Object.keys(MemberSetting_1.MemberSettingsKey);
            embed.fields.push({
                name: t('cmd.memberConfig.keys.title'),
                value: keys.join('\n')
            });
            return this.sendReply(message, embed);
        }
        const info = settings_1.memberSettingsInfo[key];
        if (!user) {
            const allSets = await this.client.cache.members.get(guild.id);
            if (allSets.size > 0) {
                allSets.forEach((set, memberId) => embed.fields.push({
                    name: guild.members.get(memberId).username,
                    value: settings_1.beautify(info.type, set[key])
                }));
            }
            else {
                embed.description = t('cmd.memberConfig.notSet');
            }
            return this.sendReply(message, embed);
        }
        const memSettings = await this.client.cache.members.getOne(guild.id, user.id);
        const oldVal = memSettings[key];
        embed.title = `${user.username}#${user.discriminator} - ${key}`;
        if (typeof value === typeof undefined) {
            // If we have no new value, just print the old one
            // Check if the old one is set
            if (oldVal) {
                embed.description = t('cmd.inviteCodeConfig.current.text', {
                    prefix,
                    key
                });
                if (info.clearable) {
                    embed.description +=
                        '\n' +
                            t('cmd.inviteCodeConfig.current.clear', {
                                prefix,
                                key
                            });
                }
                embed.fields.push({
                    name: t('cmd.inviteCodeConfig.current.title'),
                    value: settings_1.beautify(info.type, oldVal)
                });
            }
            else {
                embed.description = t('cmd.memberConfig.current.notSet', {
                    prefix,
                    key
                });
            }
            return this.sendReply(message, embed);
        }
        if (value === null) {
            if (!info.clearable) {
                await this.sendReply(message, t('cmd.memberConfig.canNotClear', { prefix, key }));
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
        value = await this.client.cache.members.setOne(guild.id, user.id, key, value);
        if (value === oldVal) {
            embed.description = t('cmd.memberConfig.sameValue');
            embed.fields.push({
                name: t('cmd.memberConfig.current.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
            return this.sendReply(message, embed);
        }
        embed.description = t('cmd.memberConfig.changed.text', { prefix, key });
        // Log the settings change
        await this.client.logAction(guild, message, Log_1.LogAction.config, {
            key,
            oldValue: oldVal,
            newValue: value
        });
        if (oldVal !== null) {
            embed.fields.push({
                name: t('cmd.memberConfig.previous.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
        }
        embed.fields.push({
            name: t('cmd.memberConfig.new.title'),
            value: value !== null ? settings_1.beautify(info.type, value) : t('cmd.memberConfig.none')
        });
        // Do any post processing, such as example messages
        const cb = await this.after(message, embed, key, value, context);
        await this.sendReply(message, embed);
        if (typeof cb === typeof Function) {
            await cb();
        }
    }
    // Validate a new config value to see if it's ok (no parsing, already done beforehand)
    validate(key, value, { t, me }) {
        return null;
    }
    // Attach additional information for a config value, such as examples
    async after(message, embed, key, value, context) {
        return null;
    }
}
exports.default = default_1;
//# sourceMappingURL=memberConfig.js.map