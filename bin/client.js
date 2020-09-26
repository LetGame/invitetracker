"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMClient = void 0;
const chalk_1 = __importDefault(require("chalk"));
const eris_1 = require("eris");
const i18n_1 = __importDefault(require("i18n"));
const moment_1 = __importDefault(require("moment"));
const GuildSettingsCache_1 = require("./framework/cache/GuildSettingsCache");
const MemberSettingsCache_1 = require("./framework/cache/MemberSettingsCache");
const PermissionsCache_1 = require("./framework/cache/PermissionsCache");
const PremiumCache_1 = require("./framework/cache/PremiumCache");
const GuildSetting_1 = require("./framework/models/GuildSetting");
const RequestHandler_1 = require("./framework/RequestHandler");
const Commands_1 = require("./framework/services/Commands");
const DatabaseService_1 = require("./framework/services/DatabaseService");
const Messaging_1 = require("./framework/services/Messaging");
const PremiumService_1 = require("./framework/services/PremiumService");
const RabbitMq_1 = require("./framework/services/RabbitMq");
const Scheduler_1 = require("./framework/services/Scheduler");
const InviteCodeSettingsCache_1 = require("./invites/cache/InviteCodeSettingsCache");
const InvitesCache_1 = require("./invites/cache/InvitesCache");
const LeaderboardCache_1 = require("./invites/cache/LeaderboardCache");
const RanksCache_1 = require("./invites/cache/RanksCache");
const VanityUrlCache_1 = require("./invites/cache/VanityUrlCache");
const Captcha_1 = require("./invites/services/Captcha");
const Invites_1 = require("./invites/services/Invites");
const Tracking_1 = require("./invites/services/Tracking");
const ReactionRoleCache_1 = require("./management/cache/ReactionRoleCache");
const ManagementService_1 = require("./management/services/ManagementService");
const PunishmentsCache_1 = require("./moderation/cache/PunishmentsCache");
const StrikesCache_1 = require("./moderation/cache/StrikesCache");
const Moderation_1 = require("./moderation/services/Moderation");
const MusicCache_1 = require("./music/cache/MusicCache");
const MusicService_1 = require("./music/services/MusicService");
const settings_1 = require("./settings");
const types_1 = require("./types");
var isSecondStatus = false;
i18n_1.default.configure({
    locales: ['cs', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'pt_BR', 'ro', 'ru', 'tr'],
    defaultLocale: 'en',
    // syncFiles: true,
    directory: __dirname + '/../i18n/bot',
    objectNotation: true,
    logDebugFn: function (msg) {
        console.log('debug', msg);
    },
    logWarnFn: function (msg) {
        console.error('warn', msg);
    },
    logErrorFn: function (msg) {
        console.error('error', msg);
    }
});
class IMClient extends eris_1.Client {
    constructor({ version, token, type, instance, shardId, shardCount, flags, config }) {
        super(token, {
            allowedMentions: {
                everyone: false,
                roles: true,
                users: true
            },
            firstShardID: shardId - 1,
            lastShardID: shardId - 1,
            maxShards: shardCount,
            disableEvents: {
                TYPING_START: true,
                PRESENCE_UPDATE: true,
                VOICE_STATE_UPDATE: true,
                USER_UPDATE: true
            },
            restMode: true,
            messageLimit: 2,
            getAllUsers: false,
            compress: true,
            guildCreateTimeout: 60000
        });
        this.hasStarted = false;
        this.disabledGuilds = new Set();
        this.stats = {
            wsEvents: 0,
            wsWarnings: 0,
            wsErrors: 0,
            cmdProcessed: 0,
            cmdErrors: 0
        };
        this.requestHandler = new RequestHandler_1.IMRequestHandler(this);
        this.version = version;
        this.type = type;
        this.instance = instance;
        this.shardId = shardId;
        this.shardCount = shardCount;
        this.flags = flags;
        this.config = config;
        this.shardId = shardId;
        this.shardCount = shardCount;
        this.service = {
            database: new DatabaseService_1.DatabaseService(this),
            rabbitmq: new RabbitMq_1.RabbitMqService(this),
            message: new Messaging_1.MessagingService(this),
            moderation: new Moderation_1.ModerationService(this),
            scheduler: new Scheduler_1.SchedulerService(this),
            commands: new Commands_1.CommandsService(this),
            captcha: new Captcha_1.CaptchaService(this),
            invites: new Invites_1.InvitesService(this),
            tracking: new Tracking_1.TrackingService(this),
            music: new MusicService_1.MusicService(this),
            premium: new PremiumService_1.PremiumService(this),
            management: new ManagementService_1.ManagementService(this)
        };
        this.startingServices = Object.values(this.service);
        this.cache = {
            inviteCodes: new InviteCodeSettingsCache_1.InviteCodeSettingsCache(this),
            invites: new InvitesCache_1.InvitesCache(this),
            vanity: new VanityUrlCache_1.VanityUrlCache(this),
            leaderboard: new LeaderboardCache_1.LeaderboardCache(this),
            ranks: new RanksCache_1.RanksCache(this),
            members: new MemberSettingsCache_1.MemberSettingsCache(this),
            permissions: new PermissionsCache_1.PermissionsCache(this),
            premium: new PremiumCache_1.PremiumCache(this),
            punishments: new PunishmentsCache_1.PunishmentCache(this),
            guilds: new GuildSettingsCache_1.GuildSettingsCache(this),
            strikes: new StrikesCache_1.StrikesCache(this),
            music: new MusicCache_1.MusicCache(this),
            reactionRoles: new ReactionRoleCache_1.ReactionRoleCache(this)
        };
        // Setup service shortcuts
        this.db = this.service.database;
        this.rabbitmq = this.service.rabbitmq;
        this.msg = this.service.message;
        this.mod = this.service.moderation;
        this.scheduler = this.service.scheduler;
        this.cmds = this.service.commands;
        this.captcha = this.service.captcha;
        this.invs = this.service.invites;
        this.music = this.service.music;
        this.tracking = this.service.tracking;
        this.premium = this.service.premium;
        this.management = this.service.management;
        this.on('ready', this.onClientReady);
        this.on('guildCreate', this.onGuildCreate);
        this.on('guildDelete', this.onGuildDelete);
        this.on('guildUnavailable', this.onGuildUnavailable);
        this.on('guildMemberAdd', this.onGuildMemberAdd);
        this.on('guildMemberRemove', this.onGuildMemberRemove);
        this.on('connect', this.onConnect);
        this.on('shardDisconnect', this.onDisconnect);
        this.on('warn', this.onWarn);
        this.on('error', this.onError);
        this.on('rawWS', this.onRawWS);
    }
    async init() {
        // Services
        await Promise.all(Object.values(this.service).map((s) => s.init()));
    }
    async waitForStartupTicket() {
        const start = process.uptime();
        const interval = setInterval(() => console.log(`Waiting for ticket since ${chalk_1.default.blue(Math.floor(process.uptime() - start))} seconds...`), 10000);
        await this.service.rabbitmq.waitForStartupTicket();
        clearInterval(interval);
    }
    async onClientReady() {
        if (this.hasStarted) {
            console.error('BOT HAS ALREADY STARTED, IGNORING EXTRA READY EVENT');
            return;
        }
        // This is for convenience, the services could also subscribe to 'ready' event on client
        await Promise.all(Object.values(this.service).map((s) => s.onClientReady()));
        this.hasStarted = true;
        this.startedAt = moment_1.default();
        const set = await this.db.getBotSettings(this.user.id);
        this.settings = set ? set.value : Object.assign({}, settings_1.botDefaultSettings);
        console.log(chalk_1.default.green(`Client ready! Serving ${chalk_1.default.blue(this.guilds.size)} guilds.`));
        // Init all caches
        await Promise.all(Object.values(this.cache).map((c) => c.init()));
        // Insert guilds into db
        await this.db.saveGuilds(this.guilds.map((g) => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL,
            memberCount: g.memberCount,
            deletedAt: null,
            banReason: null
        })));
        const bannedGuilds = await this.db.getBannedGuilds(this.guilds.map((g) => g.id));
        // Do some checks for all guilds
        this.guilds.forEach(async (guild) => {
            const bannedGuild = bannedGuilds.find((g) => g.id === guild.id);
            // Check if the guild was banned
            if (bannedGuild) {
                const dmChannel = await this.getDMChannel(guild.ownerID);
                await dmChannel
                    .createMessage(`Hi! Thanks for inviting me to your server \`${guild.name}\`!\n\n` +
                    'It looks like this guild was banned from using the InviteTracker bot.\n' +
                    'If you believe this was a mistake please contact staff on our support server.\n\n' +
                    `${this.config.bot.links.support}\n\n` +
                    'I will be leaving your server now, thanks for having me!')
                    .catch(() => undefined);
                await guild.leave();
                return;
            }
            switch (this.type) {
                case types_1.BotType.regular:
                    if (guild.members.has(this.config.bot.ids.pro)) {
                        // Otherwise disable the guild if the pro bot is in it
                        this.disabledGuilds.add(guild.id);
                    }
                    break;
                case types_1.BotType.pro:
                    // If this is the pro bot then leave any guilds that aren't pro
                    let premium = await this.cache.premium._get(guild.id);
                    if (!premium) {
                        // Let's try and see if this guild had pro before, and if maybe
                        // the member renewed it, but it didn't update.
                        const oldPremium = await this.db.getPremiumSubscriptionGuildForGuild(guild.id, false);
                        if (oldPremium) {
                            await this.premium.checkPatreon(oldPremium.memberId);
                            premium = await this.cache.premium._get(guild.id);
                        }
                        if (!premium) {
                            const dmChannel = await this.getDMChannel(guild.ownerID);
                            await dmChannel
                                .createMessage('Hi!' +
                                `Thanks for inviting me to your server \`${guild.name}\`!\n\n` +
                                'I am the pro version of InviteTracker, and only available to people ' +
                                'that support me on Patreon with the pro tier.\n\n' +
                                'To purchase the pro tier visit `no premium yet`\n\n' +
                                'If you purchased premium run `!premium check` and then `!premium activate` in the server\n\n' +
                                'I will be leaving your server soon, thanks for having me!')
                                .catch(() => undefined);
                            const onTimeout = async () => {
                                // Check one last time before leaving
                                if (await this.cache.premium._get(guild.id)) {
                                    return;
                                }
                                await guild.leave();
                            };
                            setTimeout(onTimeout, 3 * 60 * 1000);
                        }
                    }
                    break;
                default:
                    break;
            }
        });
        await this.setActivity();
        this.activityInterval = setInterval(() => this.setActivity(), 30 * 1000);
    }
    serviceStartupDone(service) {
        this.startingServices = this.startingServices.filter((s) => s !== service);
        if (this.startingServices.length === 0) {
            console.log(chalk_1.default.green(`All services ready`));
            this.rabbitmq.endStartup().catch((err) => console.error(err));
        }
    }
    async onGuildCreate(guild) {
        const channel = await this.getDMChannel(guild.ownerID);
        const dbGuild = await this.db.getGuild(guild.id);
        if (!dbGuild) {
            await this.db.saveGuilds([
                {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL,
                    memberCount: guild.memberCount,
                    createdAt: new Date(guild.createdAt),
                    deletedAt: null,
                    banReason: null
                }
            ]);
            const defChannel = await this.getDefaultChannel(guild);
            const newSettings = Object.assign(Object.assign({}, settings_1.guildDefaultSettings), { [GuildSetting_1.GuildSettingsKey.joinMessageChannel]: defChannel ? defChannel.id : null });
            await this.db.saveGuildSettings({
                guildId: guild.id,
                value: newSettings
            });
        }
        else if (dbGuild.banReason !== null) {
            await channel
                .createMessage(`Hi! Thanks for inviting me to your server \`${guild.name}\`!\n\n` +
                'It looks like this guild was banned from using the InviteTracker bot.\n' +
                'If you believe this was a mistake please contact staff on our support server.\n\n' +
                `${this.config.bot.links.support}\n\n` +
                'I will be leaving your server soon, thanks for having me!')
                .catch(() => undefined);
            await guild.leave();
            return;
        }
        // Clear the deleted timestamp if it's still set
        // We have to do this before checking premium or it will fail
        if (dbGuild && dbGuild.deletedAt) {
            dbGuild.deletedAt = null;
            await this.db.saveGuilds([dbGuild]);
        }
        // Check pro bot
        if (this.type === types_1.BotType.pro) {
            // We use a DB query instead of getting the value from the cache
            const premium = await this.cache.premium._get(guild.id);
            if (!premium) {
                await channel
                    .createMessage(`Hi! Thanks for inviting me to your server \`${guild.name}\`!\n\n` +
                    'I am the pro version of InviteTracker, and only available to people ' +
                    'that support me on Patreon with the pro tier.\n\n' +
                    'To purchase the pro tier visit `no premium avalible yet`\n\n' +
                    'If you purchased premium run `!premium check` and then `!premium activate` in the server\n\n' +
                    'I will be leaving your server soon, thanks for having me!')
                    .catch(() => undefined);
                const onTimeout = async () => {
                    if (await this.cache.premium._get(guild.id)) {
                        return;
                    }
                    await guild.leave();
                };
                setTimeout(onTimeout, 2 * 60 * 1000);
                return;
            }
        }
        // Insert tracking data
        await this.tracking.insertGuildData(guild);
        // Send welcome message to owner with setup instructions
        channel
            .createMessage('Hi! Thanks for inviting me to your server `' +
            guild.name +
            '`!\n\n' +
            'I am now tracking all invites on your server.\n\n' +
            'To get help setting up join messages or changing the prefix, please run the `!setup` command.\n\n' +
            'You can see a list of all commands using the `!help` command.\n\n' +
            `That's it! Enjoy the bot and if you have any questions, feel free to join our support server!\n` +
            'https://discord.gg/W8V2TZH')
            .catch(() => undefined);
    }
    async onGuildDelete(guild) {
        // If we're disabled it means the pro bot is in that guild,
        // so don't delete the guild
        if (this.disabledGuilds.has(guild.id)) {
            return;
        }
        // If this is the pro bot and the guild has the regular bot do nothing
        if (this.type === types_1.BotType.pro && guild.members.has(this.config.bot.ids.regular)) {
            return;
        }
        // Remove the guild (only sets the 'deletedAt' timestamp)
        await this.db.saveGuilds([
            {
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL,
                memberCount: guild.memberCount,
                deletedAt: new Date()
            }
        ]);
    }
    async onGuildMemberAdd(guild, member) {
        const guildId = guild.id;
        // Ignore disabled guilds
        if (this.disabledGuilds.has(guildId)) {
            return;
        }
        if (member.user.bot) {
            // Check if it's our pro bot
            if (this.type === types_1.BotType.regular && member.user.id === this.config.bot.ids.pro) {
                console.log(`DISABLING BOT FOR ${guildId} BECAUSE PRO VERSION IS ACTIVE`);
                this.disabledGuilds.add(guildId);
            }
            return;
        }
    }
    async onGuildMemberRemove(guild, member) {
        // If the pro version of our bot left, re-enable this version
        if (this.type === types_1.BotType.regular && member.user.id === this.config.bot.ids.pro) {
            this.disabledGuilds.delete(guild.id);
            console.log(`ENABLING BOT IN ${guild.id} BECAUSE PRO VERSION LEFT`);
        }
    }
    async getDefaultChannel(guild) {
        // get "original" default channel
        if (guild.channels.has(guild.id)) {
            return guild.channels.get(guild.id);
        }
        // Check for a "general" channel, which is often default chat
        const gen = guild.channels.find((c) => c.name === 'general');
        if (gen) {
            return gen;
        }
        // First channel in order where the bot can speak
        return guild.channels
            .filter((c) => c.type === types_1.ChannelType.GUILD_TEXT /*&&
                c.permissionsOf(guild.self).has('SEND_MESSAGES')*/)
            .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))[0];
    }
    async logModAction(guild, embed) {
        const modLogChannelId = (await this.cache.guilds.get(guild.id)).modLogChannel;
        if (modLogChannelId) {
            const logChannel = guild.channels.get(modLogChannelId);
            if (logChannel) {
                await this.msg.sendEmbed(logChannel, embed);
            }
        }
    }
    async logAction(guild, message, action, data) {
        const logChannelId = (await this.cache.guilds.get(guild.id)).logChannel;
        if (logChannelId) {
            const logChannel = guild.channels.get(logChannelId);
            if (logChannel) {
                const content = message.content.substr(0, 1000) + (message.content.length > 1000 ? '...' : '');
                let json = JSON.stringify(data, null, 2);
                if (json.length > 1000) {
                    json = json.substr(0, 1000) + '...';
                }
                const embed = this.msg.createEmbed({
                    title: 'Log Action',
                    fields: [
                        {
                            name: 'Action',
                            value: action,
                            inline: true
                        },
                        {
                            name: 'Cause',
                            value: `<@${message.author.id}>`,
                            inline: true
                        },
                        {
                            name: 'Command',
                            value: content
                        },
                        {
                            name: 'Data',
                            value: '`' + json + '`'
                        }
                    ]
                });
                await this.msg.sendEmbed(logChannel, embed);
            }
        }
        this.db.saveLog(guild, message.author, {
            id: null,
            guildId: guild.id,
            memberId: message.author.id,
            action,
            message: message.content,
            data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    // public async httpGet(theUrl:any) {
    // 	var xmlHttp = new XMLHttpRequest();
    // 	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    // 	xmlHttp.send( null );
    // 	return xmlHttp.responseText;
    // }
    async setActivity() {
        delete require.cache[require.resolve('../status.js')];
        const activity = require('../status.js');
        const status = activity.status;
        const url = 'https://invitetracker.a.sumy.ua';
        var type = activity.type;
        var name = activity.name;
        if (activity.secondStatus === false) {
            type = activity.type;
            name = activity.name;
            isSecondStatus = true;
        }
        else {
            type = activity.type2;
            name = activity.name2;
            isSecondStatus = false;
        }
        if (activity.showGuilds === true) {
            name = name.concat(' | ' + this.guilds.size + ' guilds - ' + this.users.size + ' users.');
        }
        this.editStatus(status, { name, type, url });
    }
    // console.log(chalk.green(" --- Activity update --- "))
    // console.log(chalk.green(" Status: ") + chalk.blue(status));
    // console.log(chalk.green(" Type: ") +  + chalk.blue(type));
    // console.log(chalk.green(" Name: ") +  + chalk.blue(name));
    // console.log(chalk.green(" ----------------------- "))
    async onConnect() {
        console.error('DISCORD CONNECT');
        this.gatewayConnected = true;
        await this.rabbitmq.sendStatusToManager();
    }
    async onDisconnect(err) {
        console.error('DISCORD DISCONNECT');
        this.gatewayConnected = false;
        await this.rabbitmq.sendStatusToManager(err);
        if (err) {
            console.error(err);
        }
    }
    async onGuildUnavailable(guild) {
        console.error('DISCORD GUILD_UNAVAILABLE:', guild.id);
    }
    async onWarn(warn) {
        console.error('DISCORD WARNING:', warn);
        this.stats.wsWarnings++;
    }
    async onError(error) {
        console.error('DISCORD ERROR:', error);
        this.stats.wsErrors++;
    }
    async onRawWS() {
        this.stats.wsEvents++;
    }
}
exports.IMClient = IMClient;
//# sourceMappingURL=client.js.map