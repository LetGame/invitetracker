"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicService = void 0;
const axios_1 = __importDefault(require("axios"));
const xmldoc_1 = __importDefault(require("xmldoc"));
const Service_1 = require("../../framework/services/Service");
const MusicConnection_1 = require("../models/MusicConnection");
const MusicPlatformService_1 = require("./MusicPlatformService");
const { PlayerManager } = require('eris-lavalink');
const ALPHA_INDEX = {
    '&lt': '<',
    '&gt': '>',
    '&quot': '"',
    '&apos': `'`,
    '&amp': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': `'`,
    '&amp;': '&'
};
class MusicService extends Service_1.IMService {
    constructor() {
        super(...arguments);
        this.nodes = [];
        this.musicConnections = new Map();
    }
    getMusicConnectionGuildIds() {
        return [...this.musicConnections.keys()];
    }
    async init() {
        this.cache = this.client.cache.music;
        this.platforms = new MusicPlatformService_1.MusicPlatformService(this.client);
        await this.platforms.init();
    }
    async onClientReady() {
        if (!this.client.hasStarted) {
            await this.loadMusicNodes();
            await this.platforms.onClientReady();
        }
        await super.onClientReady();
    }
    async loadMusicNodes() {
        // Load nodes from database
        this.nodes = await this.client.db.getMusicNodes();
        // Setup connections
        this.client.voiceConnections = new PlayerManager(this.client, this.nodes, {
            numShards: 1,
            userId: this.client.user.id,
            defaultRegion: 'eu',
            failoverLimit: 2
        });
    }
    async getMusicConnection(guild) {
        let conn = this.musicConnections.get(guild.id);
        if (!conn) {
            conn = new MusicConnection_1.MusicConnection(this, guild, await this.cache.get(guild.id));
            this.musicConnections.set(guild.id, conn);
        }
        return conn;
    }
    async removeConnection(guild) {
        this.musicConnections.delete(guild.id);
    }
    createPlayingEmbed(item) {
        if (!item) {
            return this.client.msg.createEmbed({
                author: null,
                title: 'Not playing',
                fields: []
            });
        }
        const embed = this.client.msg.createEmbed(item.toEmbed());
        embed.author = {
            name: `${item.author.username}#${item.author.discriminator}`,
            icon_url: item.author.avatarURL
        };
        return embed;
    }
    async getLyrics(item) {
        const { data } = await axios_1.default.get(`http://video.google.com/timedtext?lang=en&v=${item.id}`);
        const lyrics = [];
        try {
            const doc = new xmldoc_1.default.XmlDocument(data);
            doc.children.forEach((txt) => {
                lyrics.push({
                    start: Number(txt.attr.start),
                    dur: Number(txt.attr.dur),
                    text: this.decodeHTMLEntities(txt.val)
                });
            });
            return lyrics;
        }
        catch (error) {
            return [];
        }
    }
    decodeHTMLEntities(str) {
        return str.replace(/&#?[0-9a-zA-Z]+;?/g, (s) => {
            if (s.charAt(1) === '#') {
                const code = s.charAt(2).toLowerCase() === 'x' ? parseInt(s.substr(3), 16) : parseInt(s.substr(2), 10);
                if (isNaN(code) || code < -32768 || code > 65535) {
                    return '';
                }
                return String.fromCharCode(code);
            }
            return ALPHA_INDEX[s] || s;
        });
    }
    formatTime(timeInSeconds) {
        const h = Math.floor(timeInSeconds / 3600);
        const m = Math.floor((timeInSeconds - 3600 * h) / 60);
        const s = Math.floor(timeInSeconds - h * 3600 - m * 60);
        const durationParts = [];
        if (h > 0) {
            durationParts.push(h.toString().padStart(2, '0'));
        }
        durationParts.push(m.toString().padStart(2, '0'));
        durationParts.push(s.toString().padStart(2, '0'));
        return durationParts.join(':');
    }
    async getAnnouncementUrl(voice, message) {
        const msg = encodeURIComponent(message);
        const baseUrl = this.client.config.bot.music.pollyUrl;
        return `${baseUrl}/synth/${voice}?message=${msg}`;
    }
    async resolveTracks(url) {
        if (this.nodes.length === 0) {
            throw new Error('There are currently no music nodes available');
        }
        const node = this.nodes[Math.round(Math.random() * (this.nodes.length - 1))];
        const baseUrl = `http://${node.host}:${node.port}`;
        const { data } = await axios_1.default.get(`${baseUrl}/loadtracks?identifier=${encodeURIComponent(url)}`, {
            headers: {
                Authorization: node.password,
                Accept: 'application/json'
            }
        });
        return data.tracks;
    }
    async getGuildSettings(guildId) {
        return this.client.cache.guilds.get(guildId);
    }
}
exports.MusicService = MusicService;
//# sourceMappingURL=MusicService.js.map