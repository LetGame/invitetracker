"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const settings_1 = require("../../../settings");
const types_1 = require("../../../types");
const GuildSetting_1 = require("../../models/GuildSetting");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.interactiveConfig,
            aliases: ['ic'],
            args: [],
            group: types_1.CommandGroup.Config,
            botPermissions: [
                types_1.GuildPermission.ADD_REACTIONS,
                types_1.GuildPermission.MANAGE_MESSAGES,
                types_1.GuildPermission.READ_MESSAGE_HISTORY
            ],
            guildOnly: true,
            defaultAdminOnly: true
        });
        this.prev = '⬅';
        this.next = '➡';
        this.up = '↩';
        this.cancel = '❌';
        this.choices = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
    }
    async action(message, args, flags, context) {
        const embed = this.createEmbed({
            title: 'InviteManager',
            description: 'Loading...'
        });
        // Ask users to use the webpanel on the regular bot
        if (this.client.type === types_1.BotType.regular) {
            embed.description = context.t('cmd.interactiveConfig.useWeb', {
                configCmd: `\`${context.settings.prefix}config\``,
                link: ``
            });
            return this.sendReply(message, embed);
        }
        if (message.channel instanceof eris_1.GuildChannel &&
            message.channel.permissionsOf(this.client.user.id).has(types_1.GuildPermission.MANAGE_MESSAGES)) {
            await message.delete().catch(() => undefined);
        }
        const msg = await this.sendReply(message, embed);
        if (!msg) {
            return;
        }
        for (let i = 0; i < this.choices.length; i++) {
            await msg.addReaction(this.choices[i]);
        }
        await msg.addReaction(this.prev);
        await msg.addReaction(this.next);
        await msg.addReaction(this.up);
        await msg.addReaction(this.cancel);
        while ((await this.showConfigMenu(context, message.author.id, msg, [])) === 'up') {
            // NOP
        }
    }
    buildConfigMenu(path = []) {
        const menu = {
            items: [],
            subMenus: []
        };
        Object.keys(settings_1.guildSettingsInfo)
            .filter((key) => path.every((p, i) => settings_1.guildSettingsInfo[key].grouping[i] === p))
            .forEach((key) => {
            const info = settings_1.guildSettingsInfo[key];
            if (info.grouping.length === path.length) {
                menu.items.push([key, settings_1.guildSettingsInfo[key]]);
            }
            else {
                const group = info.grouping[path.length];
                if (!menu.subMenus.includes(group)) {
                    menu.subMenus.push(group);
                }
            }
        });
        return menu;
    }
    async showConfigMenu(context, authorId, msg, path) {
        const t = context.t;
        const menu = this.buildConfigMenu(path);
        const basePath = path.map((p) => `${p}.`).join('');
        let page = 0;
        do {
            let title = 'InviteManager';
            for (let i = 0; i < path.length; i++) {
                title += ' - ' + t(`settings.groups.${path.slice(0, i + 1).join('.')}.title`);
            }
            // Compute these every time so that possible value changes are shown
            const allChoices = menu.subMenus
                .map((sub) => ({
                type: 'menu',
                value: sub,
                title: t(`settings.groups.${basePath}${sub}.title`),
                description: t(`settings.groups.${basePath}${sub}.description`)
            }))
                .concat(menu.items.map((item) => ({
                type: 'key',
                value: item[0],
                title: t(`settings.${item[0]}.title`),
                description: settings_1.beautify(item[1].type, context.settings[item[0]])
            })));
            // Only extract the page we need
            const choices = allChoices.slice(page * 10, (page + 1) * 10);
            const choice = await this.showMenu(context, msg, authorId, title, `Page: ${page + 1}/${Math.ceil(allChoices.length / 10.0)}`, choices);
            if (choice === undefined) {
                // Quit menu
                return;
            }
            if (choice === 'prev') {
                // Move to previous page of items
                if (page > 0) {
                    page--;
                }
                continue;
            }
            if (choice === 'next') {
                // Move to next page of items
                if (page < Math.ceil(allChoices.length / 10.0) - 1) {
                    page++;
                }
                continue;
            }
            if (choice === 'up') {
                // Move one menu up
                return 'up';
            }
            const sel = choices[choice];
            if (sel.type === 'key') {
                const key = sel.value;
                if (settings_1.guildSettingsInfo[key].type === 'Boolean') {
                    await this.client.cache.guilds.setOne(context.guild.id, key, context.settings[key] ? false : true);
                }
                else {
                    const subChoice = await this.changeConfigSetting(context, authorId, msg, key);
                    if (subChoice === undefined) {
                        // Quit menu
                        return;
                    }
                }
            }
            else {
                const subChoice = await this.showConfigMenu(context, authorId, msg, path.concat([sel.value]));
                if (subChoice === undefined) {
                    // Quit menu
                    return;
                }
            }
        } while (true);
    }
    async changeConfigSetting(context, authorId, msg, key) {
        const info = settings_1.guildSettingsInfo[key];
        const isList = info.type.endsWith('[]');
        const title = key;
        const possible = info.possibleValues
            ? info.possibleValues.map((v) => '`' + v + '`').join(', ')
            : context.t(`cmd.interactiveConfig.values.${info.type.toLowerCase()}`);
        let error = null;
        do {
            const val = context.settings[key];
            const current = settings_1.beautify(info.type, val);
            const text = context.t('cmd.interactiveConfig.change', {
                current,
                possible
            });
            const description = context.t(`settings.${key}.description`) + `\n\n${text}\n\n${error ? '```diff\n- ' + error + '```\n\n' : ''}`;
            if (isList) {
                const listOptions = [
                    {
                        title: context.t('cmd.interactiveConfig.list.add.title'),
                        description: context.t('cmd.interactiveConfig.list.add.text')
                    },
                    {
                        title: context.t('cmd.interactiveConfig.list.remove.title'),
                        description: context.t('cmd.interactiveConfig.list.remove.text')
                    },
                    {
                        title: context.t('cmd.interactiveConfig.list.set.title'),
                        description: context.t('cmd.interactiveConfig.list.set.text')
                    },
                    {
                        title: context.t('cmd.interactiveConfig.list.clear.title'),
                        description: context.t('cmd.interactiveConfig.list.clear.text')
                    }
                ];
                const choice = await this.showMenu(context, msg, authorId, title, description, listOptions, false);
                if (choice === undefined) {
                    // Quit menu
                    return;
                }
                if (choice === 'prev' || choice === 'next') {
                    // Ignore invalid options
                    continue;
                }
                if (choice === 'up') {
                    // Move one menu up
                    return 'up';
                }
                error = null;
                let newVal = undefined;
                if (choice === 0) {
                    // Add item
                    const embed = this.createEmbed({
                        title,
                        description: description + '**' + context.t('cmd.interactiveConfig.add') + '**'
                    });
                    await msg.edit({ embed });
                    try {
                        const rawNewVal = await this.parseInput(context, authorId, msg, key);
                        if (typeof rawNewVal !== 'undefined') {
                            error = this.validate(key, rawNewVal, context);
                            if (error) {
                                continue;
                            }
                            newVal = val
                                .concat(settings_1.toDbValue(info, rawNewVal))
                                .filter((v, i, list) => list.indexOf(v) === i);
                        }
                    }
                    catch (err) {
                        error = err.message;
                        continue;
                    }
                }
                else if (choice === 1) {
                    // Remove item
                    // Check empty
                    if (val.length === 0) {
                        error = context.t('cmd.interactiveConfig.removeEmpty');
                        continue;
                    }
                    const embed = this.createEmbed({
                        title,
                        description: description + '**' + context.t('cmd.interactiveConfig.remove') + '**'
                    });
                    await msg.edit({ embed });
                    try {
                        const rawNewVal = await this.parseInput(context, authorId, msg, key);
                        if (typeof rawNewVal !== 'undefined') {
                            newVal = val.filter((v) => rawNewVal.indexOf(v) === -1);
                        }
                    }
                    catch (err) {
                        error = err.message;
                        continue;
                    }
                }
                else if (choice === 2) {
                    // Set list
                    const embed = this.createEmbed({
                        title,
                        description: description + '**' + context.t('cmd.interactiveConfig.set') + '**'
                    });
                    await msg.edit({ embed });
                    try {
                        const rawNewVal = await this.parseInput(context, authorId, msg, key);
                        if (typeof rawNewVal !== 'undefined') {
                            error = this.validate(key, rawNewVal, context);
                            if (error) {
                                continue;
                            }
                            newVal = settings_1.toDbValue(info, rawNewVal);
                        }
                    }
                    catch (err) {
                        error = err.message;
                    }
                }
                else if (choice === 3) {
                    // Clear list
                    newVal = [];
                }
                if (typeof newVal !== 'undefined') {
                    await this.client.cache.guilds.setOne(context.guild.id, key, newVal);
                }
            }
            else {
                // Change a non-list setting
                const embed = this.createEmbed({
                    title,
                    description: description + '**' + context.t('cmd.interactiveConfig.new') + '**'
                });
                await msg.edit({ embed });
                try {
                    const rawNewVal = await this.parseInput(context, authorId, msg, key);
                    if (typeof rawNewVal === 'undefined') {
                        return 'up';
                    }
                    error = this.validate(key, rawNewVal, context);
                    if (error) {
                        continue;
                    }
                    const newValue = settings_1.toDbValue(info, rawNewVal);
                    await this.client.cache.guilds.setOne(context.guild.id, key, newValue);
                    return 'up';
                }
                catch (err) {
                    error = err.message;
                }
            }
        } while (true);
    }
    async parseInput(context, authorId, msg, key) {
        return new Promise(async (resolve, reject) => {
            let timeOut;
            const func = async (userMsg, emoji, userId) => {
                clearTimeout(timeOut);
                this.client.removeListener('messageCreate', func);
                this.client.removeListener('messageReactionAdd', func);
                if (emoji && userId === authorId) {
                    await msg.removeReaction(emoji.name, userId);
                    resolve();
                }
                else if (userMsg.author && userMsg.author.id === authorId) {
                    await userMsg.delete().catch(() => undefined);
                    new resolvers_1.SettingsValueResolver(this.client, settings_1.guildSettingsInfo)
                        .resolve(userMsg.content, context, [key])
                        .then((v) => resolve(v))
                        .catch((err) => reject(err));
                }
            };
            this.client.on('messageCreate', func);
            this.client.on('messageReactionAdd', func);
            const timeOutFunc = () => {
                this.client.removeListener('messageCreate', func);
                this.client.removeListener('messageReactionAdd', func);
                resolve();
            };
            timeOut = setTimeout(timeOutFunc, 60000);
        });
    }
    async showMenu(context, msg, authorId, title, description, items, showWelcome = true) {
        const t = context.t;
        let welcomeText = '';
        if (showWelcome) {
            welcomeText =
                t('cmd.interactiveConfig.welcome', {
                    prev: this.prev,
                    next: this.next,
                    up: this.up,
                    cancel: this.cancel
                }) + '\n\n';
        }
        const embed = this.createEmbed({
            title,
            description: welcomeText + description,
            fields: items.map((item, i) => ({
                name: `${i + 1}. ${item.title}`,
                value: item.description !== null && item.description !== '' ? item.description : t('cmd.interactiveConfig.none')
            }))
        });
        do {
            const editMsg = await msg.edit({ embed }).catch(() => null);
            if (editMsg === null) {
                // Quit menu on error
                return;
            }
            const choice = await this.awaitChoice(authorId, msg);
            if (choice === undefined) {
                // Quit menu
                return;
            }
            if (choice === 'up' || choice === 'prev' || choice === 'next') {
                // Move one menu up
                return choice;
            }
            if (choice >= items.length) {
                // Restart this menu
                continue;
            }
            // Return the choice the user picked
            return choice;
        } while (true);
    }
    async awaitChoice(authorId, msg) {
        return new Promise(async (resolve) => {
            let timeOut;
            const func = async (resp, emoji, userId) => {
                if (resp.id !== msg.id || authorId !== userId) {
                    return;
                }
                clearTimeout(timeOut);
                this.client.removeListener('messageReactionAdd', func);
                if (emoji.name === this.cancel) {
                    await msg.delete().catch(() => undefined);
                    resolve();
                    return;
                }
                const id = this.choices.indexOf(emoji.name);
                if (resp.channel.permissionsOf(this.client.user.id).has(types_1.GuildPermission.MANAGE_MESSAGES)) {
                    await this.client.removeMessageReaction(resp.channel.id, resp.id, emoji.name, userId);
                }
                if (emoji.name === this.prev) {
                    resolve('prev');
                }
                else if (emoji.name === this.next) {
                    resolve('next');
                }
                else if (emoji.name === this.up) {
                    resolve('up');
                }
                else {
                    resolve(id);
                }
            };
            this.client.on('messageReactionAdd', func);
            const timeOutFunc = async () => {
                this.client.removeListener('messageReactionAdd', func);
                await msg.delete().catch(() => undefined);
                resolve(undefined);
            };
            timeOut = setTimeout(timeOutFunc, 60000);
        });
    }
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
}
exports.default = default_1;
//# sourceMappingURL=interactiveConfig.js.map