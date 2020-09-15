"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMqService = void 0;
const node_1 = require("@sentry/node");
const amqplib_1 = require("amqplib");
const chalk_1 = __importDefault(require("chalk"));
const moment_1 = __importDefault(require("moment"));
const types_1 = require("../../types");
const Service_1 = require("./Service");
const BOT_SHARDING = 16;
class RabbitMqService extends Service_1.IMService {
    constructor() {
        super(...arguments);
        this.connRetry = 0;
        this.channelRetry = 0;
        this.msgQueue = [];
    }
    async init() {
        if (this.client.flags.includes('--no-rabbitmq')) {
            return;
        }
        await this.initConnection();
        await this.initChannel();
    }
    async initConnection() {
        try {
            const conn = await amqplib_1.connect(this.client.config.rabbitmq);
            this.conn = conn;
            this.conn.on('close', async (err) => {
                if (err) {
                    console.error(err);
                }
                await this.shutdownConnection();
                setTimeout(() => this.initConnection(), this.connRetry * 30);
                this.connRetry++;
            });
        }
        catch (err) {
            console.error(err);
            await this.shutdownConnection();
            await this.initConnection();
        }
    }
    async shutdownConnection() {
        await this.shutdownChannel();
        if (this.conn) {
            try {
                await this.conn.close();
            }
            catch (_a) {
                // NO-OP
            }
            this.conn = null;
        }
    }
    async initChannel() {
        if (!this.conn) {
            return;
        }
        this.connRetry = 0;
        this.qName = `shard-${this.client.instance}-${this.client.shardId}`;
        try {
            this.channel = await this.conn.createChannel();
            this.channel.on('close', async (err) => {
                if (err) {
                    console.error(err);
                }
                await this.shutdownChannel();
                setTimeout(() => this.initChannel(), this.channelRetry * 30);
                this.channelRetry++;
            });
            while (this.msgQueue.length > 0) {
                await this.sendToManager(this.msgQueue.pop(), true);
            }
            await this.channel.prefetch(5);
            await this.channel.assertQueue(this.qName, { durable: false, autoDelete: true });
            await this.channel.assertExchange('shards', 'fanout', { durable: true });
            await this.channel.bindQueue(this.qName, 'shards', '');
            this.channel.consume(this.qName, (msg) => this.onShardCommand(msg), { noAck: false });
            this.channelRetry = 0;
        }
        catch (err) {
            console.error(err);
            await this.shutdownChannel();
            await this.initChannel();
        }
    }
    async shutdownChannel() {
        if (this.channel) {
            try {
                await this.channel.close();
            }
            catch (_a) {
                // NO-OP
            }
            this.channel = null;
        }
    }
    async waitForStartupTicket() {
        if (!this.conn) {
            console.log(chalk_1.default.yellow('No connection available, this is ok for single installations or in dev mode.'));
            console.log(chalk_1.default.yellow('Skipping start ticket...'));
            return;
        }
        // Don't do this for custom bots
        if (this.client.type === types_1.BotType.custom) {
            return;
        }
        // const startupSuffix = this.client.shardCount > BOT_SHARDING ? `-${this.client.shardId % BOT_SHARDING}` : '';
        const startupSuffix = '';
        this.qNameStartup = `shard-${this.client.instance}-start${startupSuffix}`;
        this.channelStartup = await this.conn.createChannel();
        this.channelStartup.on('close', async (err) => {
            this.waitingForTicket = false;
            // If we have a ticket we are probably closing the channel after startup is complete
            if (this.startTicket) {
                return;
            }
            if (err) {
                node_1.captureException(err);
                console.error(err);
            }
            console.error('Could not aquire startup ticket');
            process.exit(1);
        });
        await this.channelStartup.prefetch(1);
        await this.channelStartup.assertQueue(this.qNameStartup, { durable: true, autoDelete: false, maxPriority: 10 });
        // Reset the ticket
        this.startTicket = null;
        this.waitingForTicket = true;
        // Return a promise that resolves when we aquire a start ticket (a rabbitmq message)
        return new Promise((resolve) => {
            // Start listening on the queue for one message (our start ticket)
            this.channelStartup.consume(this.qNameStartup, (msg) => {
                console.log(chalk_1.default.green(`Aquired start ticket!`));
                this.waitingForTicket = false;
                // Save the ticket so we can return it to the queue when our startup is done
                this.startTicket = msg;
                resolve();
            }, { noAck: false, priority: this.client.hasStarted ? 1 : 0 });
        });
    }
    async endStartup() {
        if (!this.channelStartup) {
            return;
        }
        // Nack the message, so that it gets returned to the queue for the next process to use
        this.channelStartup.nack(this.startTicket, false, true);
        // Close the channel because we don't want another ticket
        await this.channelStartup.close();
        this.channelStartup = null;
        this.startTicket = null;
    }
    async sendToManager(message, isResend = false) {
        if (!this.conn) {
            console.log('Send message to RabbitMQ', JSON.stringify(message, null, 2));
            return;
        }
        if (!this.channel) {
            if (!isResend) {
                this.msgQueue.push(message);
            }
            return;
        }
        this.channel.sendToQueue('manager', Buffer.from(JSON.stringify(Object.assign({ timestamp: moment_1.default().unix(), type: this.client.type, instance: this.client.instance, shardId: this.client.shardId, shardCount: this.client.shardCount, service: 'bot' }, message))));
    }
    async sendStatusToManager(err) {
        var _a;
        await this.sendToManager({
            id: 'status',
            cmd: types_1.ShardCommand.STATUS,
            state: this.waitingForTicket
                ? 'waiting'
                : !this.client.hasStarted
                    ? 'init'
                    : !!this.startTicket
                        ? 'starting'
                        : 'running',
            startedAt: (_a = this.client.startedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
            gateway: this.client.gatewayConnected,
            guilds: this.client.guilds.size,
            error: err ? err.message : null,
            tracking: this.getTrackingStatus(),
            music: this.getMusicStatus(),
            cache: this.getCacheSizes(),
            metrics: this.getMetrics()
        });
    }
    async onShardCommand(msg) {
        const content = JSON.parse(msg.content.toString());
        const cmd = content.cmd;
        const guildId = content.guildId;
        const guild = this.client.guilds.get(guildId);
        console.log(`RECEIVED SHARD COMMAND: ${JSON.stringify(content)}`);
        this.channel.ack(msg, false);
        const sendResponse = (message) => this.sendToManager(Object.assign({ id: content.id, cmd: content.cmd }, message));
        switch (cmd) {
            case types_1.ShardCommand.STATUS:
                await this.sendStatusToManager();
                break;
            case types_1.ShardCommand.CUSTOM:
                const self = await this.client.getSelf();
                await sendResponse({
                    self,
                    guilds: this.client.guilds.map((g) => ({
                        id: g.id,
                        name: g.name,
                        icon: g.iconURL,
                        memberCount: g.memberCount
                    }))
                });
                break;
            case types_1.ShardCommand.CACHE:
                await sendResponse(this.getCacheSizes());
                break;
            case types_1.ShardCommand.DIAGNOSE:
                if (!guild) {
                    return sendResponse({
                        error: `Guild ${guildId} not found`
                    });
                }
                const sets = await this.client.cache.guilds.get(guildId);
                const perms = guild.members.get(this.client.user.id).permission.json;
                let joinChannelPerms = {};
                if (sets.joinMessageChannel) {
                    const joinChannel = guild.channels.get(sets.joinMessageChannel);
                    if (joinChannel) {
                        joinChannelPerms = joinChannel.permissionsOf(this.client.user.id).json;
                    }
                    else {
                        joinChannelPerms = { 'Invalid channel': true };
                    }
                }
                else {
                    joinChannelPerms = { 'Not set': true };
                }
                let leaveChannelPerms = {};
                if (sets.leaveMessageChannel) {
                    const leaveChannel = guild.channels.get(sets.leaveMessageChannel);
                    if (leaveChannel) {
                        leaveChannelPerms = leaveChannel.permissionsOf(this.client.user.id).json;
                    }
                    else {
                        leaveChannelPerms = { 'Invalid channel': true };
                    }
                }
                else {
                    leaveChannelPerms = { 'Not set': true };
                }
                let annChannelPerms = {};
                if (sets.rankAnnouncementChannel) {
                    const annChannel = guild.channels.get(sets.rankAnnouncementChannel);
                    if (annChannel) {
                        annChannelPerms = annChannel.permissionsOf(this.client.user.id).json;
                    }
                    else {
                        annChannelPerms = { 'Invalid channel': true };
                    }
                }
                else {
                    annChannelPerms = { 'Not set': true };
                }
                const owner = await this.client.getRESTUser(guild.ownerID).catch(() => undefined);
                const premium = await this.client.cache.premium.get(guildId);
                const disabled = this.client.disabledGuilds.has(guildId);
                await sendResponse({
                    owner,
                    premium,
                    disabled,
                    settings: sets,
                    perms,
                    joinChannelPerms,
                    leaveChannelPerms,
                    announceChannelPerms: annChannelPerms
                });
                break;
            case types_1.ShardCommand.FLUSH_CACHE:
                const errors = [];
                const cacheNames = content.caches;
                if (!content.caches) {
                    Object.values(this.client.cache).forEach((c) => c.flush(guildId));
                }
                else {
                    for (const cacheName of cacheNames) {
                        const cache = this.client.cache[cacheName];
                        if (cache) {
                            cache.flush(guildId);
                        }
                        else {
                            errors.push('Invalid cache name ' + cacheName);
                        }
                    }
                }
                await sendResponse({ error: errors.join('\n') });
                break;
            case types_1.ShardCommand.RELOAD_MUSIC_NODES:
                await this.client.music.loadMusicNodes();
                await sendResponse({});
                break;
            case types_1.ShardCommand.LEAVE_GUILD:
                if (!guild) {
                    return sendResponse({
                        error: 'Guild not found'
                    });
                }
                await guild.leave();
                await sendResponse({});
                break;
            case types_1.ShardCommand.OWNER_DM:
                try {
                    const user = await this.client.getRESTUser(content.userId);
                    const userChannel = await user.getDMChannel();
                    await userChannel.createMessage(content.message);
                    await sendResponse({ ok: true });
                }
                catch (e) {
                    await sendResponse({ ok: false, error: e });
                }
                break;
            case types_1.ShardCommand.USER_DM:
                const dmChannel = guild.channels.get(content.channelId);
                const sender = content.user;
                const embed = this.client.msg.createEmbed({
                    author: {
                        name: `${sender.username}#${sender.discriminator}`,
                        url: sender.avatarURL
                    },
                    description: content.message
                });
                embed.fields.push({
                    name: 'User ID',
                    value: sender.id,
                    inline: true
                });
                embed.fields.push({
                    name: 'Initial message',
                    value: content.isInitial,
                    inline: true
                });
                await dmChannel.createMessage({
                    embed
                });
                break;
            default:
                console.error(`UNKNOWN COMMAND: ${cmd}`);
        }
    }
    getTrackingStatus() {
        return {
            pendingGuilds: this.client.tracking.pendingGuilds.size,
            initialPendingGuilds: this.client.tracking.initialPendingGuilds
        };
    }
    getMusicStatus() {
        return {
            connections: this.client.music.getMusicConnectionGuildIds()
        };
    }
    getCacheSizes() {
        let channelCount = this.client.groupChannels.size + this.client.privateChannels.size;
        let roleCount = 0;
        this.client.guilds.forEach((g) => {
            channelCount += g.channels.size;
            roleCount += g.roles.size;
        });
        return {
            guilds: this.client.guilds.size,
            users: this.client.users.size,
            channels: channelCount,
            roles: roleCount,
            ranks: this.client.cache.ranks.getSize(),
            settings: this.client.cache.guilds.getSize(),
            premium: this.client.cache.premium.getSize(),
            permissions: this.client.cache.permissions.getSize(),
            strikes: this.client.cache.strikes.getSize(),
            punishments: this.client.cache.punishments.getSize(),
            inviteCodes: this.client.cache.inviteCodes.getSize(),
            members: this.client.cache.members.getSize(),
            messages: this.client.mod.getMessageCacheSize()
        };
    }
    getMetrics() {
        const req = this.client.requestHandler;
        return {
            wsEvents: this.client.stats.wsEvents,
            wsWarnings: this.client.stats.wsWarnings,
            wsErrors: this.client.stats.wsErrors,
            cmdProcessed: this.client.stats.cmdProcessed,
            cmdErrors: this.client.stats.cmdErrors,
            httpRequests: [...req.requestStats.entries()].map(([url, stats]) => ({ url, stats })),
            httpRequestsQueued: Object.keys(req.ratelimits)
                .filter((endpoint) => req.ratelimits[endpoint]._queue.length > 0)
                .reduce((acc, endpoint) => acc.concat([{ endpoint, count: req.ratelimits[endpoint]._queue.length }]), [])
        };
    }
}
exports.RabbitMqService = RabbitMqService;
//# sourceMappingURL=RabbitMq.js.map