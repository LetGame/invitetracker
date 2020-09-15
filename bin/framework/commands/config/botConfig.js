"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../../../settings");
const types_1 = require("../../../types");
const BotSetting_1 = require("../../models/BotSetting");
const Log_1 = require("../../models/Log");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.botConfig,
            aliases: ['bot-config', 'botSetting', 'bot-setting'],
            args: [
                {
                    name: 'key',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(BotSetting_1.BotSettingsKey))
                },
                {
                    name: 'value',
                    resolver: new resolvers_1.SettingsValueResolver(client, settings_1.botSettingsInfo),
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Config,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [key, value], flags, context) {
        const { guild, t } = context;
        if (this.client.type !== 'custom') {
            await this.sendReply(message, t('cmd.botConfig.customOnly', {
                prefix: context.settings.prefix,
                patreon: this.client.config.bot.links.patreon
            }));
            return;
        }
        const settings = this.client.settings;
        const prefix = context.settings.prefix;
        const embed = this.createEmbed();
        if (!key) {
            embed.title = t('cmd.botConfig.title');
            embed.description = t('cmd.botConfig.text', { prefix }) + '\n\n';
            const configs = {};
            Object.keys(settings_1.botSettingsInfo).forEach((k) => {
                const inf = settings_1.botSettingsInfo[k];
                if (!configs[inf.grouping[0]]) {
                    configs[inf.grouping[0]] = [];
                }
                configs[inf.grouping[0]].push('`' + k + '`');
            });
            Object.keys(configs).forEach((group) => {
                embed.description += `**${group}**\n` + configs[group].join(', ') + '\n\n';
            });
            return this.sendReply(message, embed);
        }
        const info = settings_1.botSettingsInfo[key];
        const oldVal = settings[key];
        embed.title = key;
        if (typeof value === typeof undefined) {
            // If we have no new value, just print the old one
            // Check if the old one is set
            if (oldVal !== null) {
                embed.description = t('cmd.botConfig.current.text', {
                    prefix,
                    key
                });
                if (info.clearable) {
                    embed.description +=
                        '\n' +
                            t('cmd.botConfig.current.clear', {
                                prefix,
                                key
                            });
                }
                embed.fields.push({
                    name: t('cmd.botConfig.current.title'),
                    value: settings_1.beautify(info.type, oldVal)
                });
            }
            else {
                embed.description = t('cmd.botConfig.current.notSet', {
                    prefix,
                    key
                });
            }
            return this.sendReply(message, embed);
        }
        // If the value is null we want to clear it. Check if that's allowed.
        if (value === null) {
            if (!info.clearable) {
                return this.sendReply(message, t('cmd.botConfig.canNotClear', { prefix, key }));
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
        this.client.settings[key] = value;
        await this.client.db.saveBotSettings({
            id: this.client.user.id,
            value: this.client.settings
        });
        await this.client.setActivity();
        if (value === oldVal) {
            embed.description = t('cmd.botConfig.sameValue');
            embed.fields.push({
                name: t('cmd.botConfig.current.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
            return this.sendReply(message, embed);
        }
        embed.description = t('cmd.botConfig.changed.text', { prefix, key });
        // Log the settings change
        await this.client.logAction(guild, message, Log_1.LogAction.config, {
            key,
            oldValue: oldVal,
            newValue: value
        });
        if (oldVal !== null && oldVal !== undefined) {
            embed.fields.push({
                name: t('cmd.botConfig.previous.title'),
                value: settings_1.beautify(info.type, oldVal)
            });
        }
        embed.fields.push({
            name: t('cmd.botConfig.new.title'),
            value: value !== null ? settings_1.beautify(info.type, value) : t('cmd.botConfig.none')
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
        if (value === null || value === undefined) {
            return null;
        }
        if (key === BotSetting_1.BotSettingsKey.activityUrl) {
            const url = value;
            if (!url.startsWith('https://twitch.tv/')) {
                return t('cmd.botConfig.invalid.twitchOnly');
            }
        }
        return null;
    }
    // Attach additional information for a config value, such as examples
    async after(message, embed, key, value, context) {
        return;
    }
}
exports.default = default_1;
//# sourceMappingURL=botConfig.js.map