"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../../../settings");
const types_1 = require("../../../types");
const InviteCodeSetting_1 = require("../../models/InviteCodeSetting");
const Log_1 = require("../../models/Log");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.inviteCodeConfig,
            aliases: ['invite-code-config', 'icc'],
            args: [
                {
                    name: 'key',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(InviteCodeSetting_1.InviteCodeSettingsKey))
                },
                {
                    name: 'inviteCode',
                    resolver: resolvers_1.InviteCodeResolver
                },
                {
                    name: 'value',
                    resolver: new resolvers_1.SettingsValueResolver(client, settings_1.inviteCodeSettingsInfo),
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Config,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [key, inv, value], flags, context) {
        const { guild, settings, t } = context;
        const prefix = settings.prefix;
        const embed = this.createEmbed();
        if (!key) {
            embed.title = t('cmd.inviteCodeConfig.title');
            embed.description = t('cmd.inviteCodeConfig.text', { prefix });
            const keys = Object.keys(InviteCodeSetting_1.InviteCodeSettingsKey);
            embed.fields.push({
                name: t('cmd.inviteCodeConfig.keys.title'),
                value: keys.join('\n')
            });
            return this.sendReply(message, embed);
        }
        const info = settings_1.inviteCodeSettingsInfo[key];
        if (!inv) {
            const allSets = await this.client.cache.inviteCodes.get(guild.id);
            if (allSets.size > 0) {
                allSets.forEach((set, invCode) => embed.fields.push({
                    name: invCode,
                    value: settings_1.beautify(info.type, set[key])
                }));
            }
            else {
                embed.description = t('cmd.inviteCodeConfig.noneSet');
            }
            return this.sendReply(message, embed);
        }
        // Check if this is actually a real invite code
        if (inv.guild.id !== guild.id) {
            return this.sendReply(message, t('cmd.inviteCodeConfig.codeForOtherGuild'));
        }
        const codeSettings = await this.client.cache.inviteCodes.getOne(guild.id, inv.code);
        const oldVal = codeSettings[key];
        embed.title = `${inv.code} - ${key}`;
        if (typeof value === typeof undefined) {
            // If we have no new value, just print the old one
            // Check if the old one is set
            if (oldVal !== null) {
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
                embed.description = t('cmd.inviteCodeConfig.current.notSet', {
                    prefix,
                    key
                });
            }
            return this.sendReply(message, embed);
        }
        // If the value is null we want to clear it. Check if that's allowed.
        if (value === null) {
            if (!info.clearable) {
                return this.sendReply(message, t('cmd.inviteCodeConfig.canNotClear', { prefix, key }));
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
        value = await this.client.cache.inviteCodes.setOne(guild.id, inv.code, key, value);
        if (value === oldVal) {
            embed.description = t('cmd.inviteCodeConfig.sameValue');
            embed.fields.push({
                name: t('cmd.inviteCodeConfig.current.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
            return this.sendReply(message, embed);
        }
        embed.description = t('cmd.inviteCodeConfig.changed.text', { prefix, key });
        // Log the settings change
        await this.client.logAction(guild, message, Log_1.LogAction.config, {
            key,
            oldValue: oldVal,
            newValue: value
        });
        if (oldVal !== null) {
            embed.fields.push({
                name: t('cmd.inviteCodeConfig.previous.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
        }
        embed.fields.push({
            name: t('cmd.inviteCodeConfig.new.title'),
            value: value !== null ? settings_1.beautify(info.type, value) : t('cmd.inviteCodeConfig.none')
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
//# sourceMappingURL=inviteCodeConfig.js.map