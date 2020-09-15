"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicConnection = void 0;
const DEFAULT_DIM_VOLUME_FACTOR = 0.2;
const IGNORED_ANNOUNCEMENT_WORDS = [
    /official/gi,
    /originals?/gi,
    /videos?/gi,
    /songs?/gi,
    /lyrics?/gi,
    /[\(\[\{].*?[\)\[\{]/gi
];
class MusicConnection {
    constructor(service, guild, musicQueueCache) {
        this.volume = 100;
        this.doPlayNext = true;
        this.speaking = new Set();
        this.lastUpdate = 0;
        this.playStart = 0;
        this.preparingNext = false;
        this.service = service;
        this.guild = guild;
        this.musicQueueCache = musicQueueCache;
        this.onSpeakingStart = this.onSpeakingStart.bind(this);
        this.onSpeakingEnd = this.onSpeakingEnd.bind(this);
        this.onStateUpdate = this.onStateUpdate.bind(this);
        this.onStreamEnd = this.onStreamEnd.bind(this);
    }
    switchChannel(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.player.switchChannel(voiceChannel.id);
    }
    isPlaying() {
        return this.player && this.player.playing;
    }
    isPaused() {
        return this.player && this.player.paused;
    }
    isConnected() {
        return !!this.player;
    }
    async play(item, voiceChannel, next) {
        if (!item.author) {
            throw new Error(`No author on music item ${item.toString()}`);
        }
        if (voiceChannel) {
            await this.connect(voiceChannel);
        }
        else if (!this.player) {
            if (this.voiceChannel) {
                await this.connect(this.voiceChannel);
            }
            else {
                throw new Error('Not connected and no voice channel specified');
            }
        }
        if (next) {
            this.musicQueueCache.queue.unshift(item);
        }
        else {
            this.musicQueueCache.queue.push(item);
        }
        if (!this.isPlaying()) {
            await this.playNext();
        }
    }
    pause() {
        if (!this.player.paused) {
            this.player.pause();
        }
    }
    resume() {
        if (this.player.paused) {
            this.player.resume();
        }
    }
    async rewind() {
        await this.seek(0);
    }
    async skip(amount = 1) {
        await this.playNext(amount - 1);
    }
    isRepeating() {
        return this.repeat;
    }
    setRepeat(repeat) {
        this.repeat = repeat;
    }
    getVolume() {
        return this.volume;
    }
    setVolume(volume) {
        this.volume = volume;
        this.player.setVolume(volume);
    }
    getNowPlaying() {
        return this.musicQueueCache.current;
    }
    getPlayTime() {
        const time = this.player && this.player.paused ? this.lastUpdate : new Date().getTime();
        return (time - this.playStart) / 1000;
    }
    getQueue() {
        return this.musicQueueCache.queue;
    }
    async connect(channel) {
        if (this.player) {
            this.switchChannel(channel);
        }
        else {
            this.settings = await this.service.getGuildSettings(this.guild.id);
            this.volume = this.settings.musicVolume;
            this.voiceChannel = channel;
            this.player = (await channel.join({}));
            this.player.setVolume(this.volume);
            this.player.on('warn', (error) => console.error(error));
            this.player.on('error', (error) => console.error(error));
            this.player.on('speakingStart', this.onSpeakingStart);
            this.player.on('speakingStop', this.onSpeakingEnd);
            this.player.on('stateUpdate', this.onStateUpdate);
            this.player.on('end', this.onStreamEnd);
            this.player.on('reconnect', () => {
                console.error(`Reconnected lavalink player for guild ${this.guild.id}`);
            });
            this.player.on('disconnect', async () => {
                console.error(`Player disconnected for guild ${this.guild.id}`);
                this.player = null;
                this.voiceChannel.leave();
                await this.service.removeConnection(this.guild);
            });
        }
    }
    onStateUpdate(data) {
        this.lastUpdate = new Date().getTime();
        this.playStart = this.lastUpdate - data.position;
    }
    onSpeakingStart(userId) {
        if (this.settings.fadeMusicOnTalk && this.speaking.size === 0) {
            if (this.stopSpeakingTimeout) {
                clearTimeout(this.stopSpeakingTimeout);
                this.stopSpeakingTimeout = null;
            }
            else {
                this.player.setVolume(DEFAULT_DIM_VOLUME_FACTOR * this.volume);
            }
        }
        this.speaking.add(userId);
    }
    onSpeakingEnd(userId) {
        this.speaking.delete(userId);
        if (this.settings.fadeMusicOnTalk && this.speaking.size === 0) {
            const func = () => {
                this.stopSpeakingTimeout = null;
                this.player.setVolume(this.volume);
            };
            this.stopSpeakingTimeout = setTimeout(func, this.settings.fadeMusicEndDelay * 1000);
        }
    }
    async onStreamEnd(data) {
        console.log(data);
        if (data.reason && data.reason === 'REPLACED') {
            return;
        }
        if (this.repeat && this.musicQueueCache.current) {
            this.musicQueueCache.queue.push(this.musicQueueCache.current.clone());
        }
        this.musicQueueCache.current = null;
        if (this.doneCallback) {
            this.doneCallback();
            this.doneCallback = null;
        }
        if (this.doPlayNext) {
            await this.playNext();
        }
    }
    async playAnnouncement(voice, message, channel) {
        if (!this.player || channel) {
            await this.connect(channel);
        }
        this.doPlayNext = false;
        return new Promise(async (resolve) => {
            this.doneCallback = async () => {
                this.doPlayNext = true;
                resolve();
            };
            const url = await this.service.getAnnouncementUrl(voice, message);
            const tracks = await this.service.resolveTracks(url);
            this.player.play(tracks[0].track);
        });
    }
    async playNext(skip = 0) {
        if (this.preparingNext) {
            return;
        }
        this.preparingNext = true;
        for (let i = 0; i < skip; i++) {
            this.musicQueueCache.queue.shift();
        }
        const next = this.musicQueueCache.queue.shift();
        if (next) {
            if (this.settings.announceNextSong) {
                let sanitizedTitle = next.title || '';
                IGNORED_ANNOUNCEMENT_WORDS.forEach((word) => (sanitizedTitle = sanitizedTitle.replace(word, '')));
                if (sanitizedTitle) {
                    await this.playAnnouncement(this.settings.announcementVoice, 'Playing: ' + sanitizedTitle).catch(() => undefined);
                }
            }
            const stream = await next.getStreamUrl().catch(() => undefined);
            const tracks = await this.service.resolveTracks(stream).catch(() => []);
            if (tracks.length === 0) {
                this.preparingNext = false;
                await this.playNext();
                return;
            }
            // +400 is the additional time lavalink is buffering, we sync up later so it's no that important
            this.playStart = new Date().getTime() + 400;
            this.player.playing = true;
            this.player.paused = false;
            this.musicQueueCache.current = next;
            this.player.play(tracks[0].track);
        }
        else if (this.musicQueueCache.current) {
            this.player.stop();
        }
        this.preparingNext = false;
    }
    async seek(offsetSeconds) {
        const now = new Date().getTime();
        this.playStart = now - offsetSeconds * 1000 + 200;
        this.player.seek(offsetSeconds * 1000);
    }
    async disconnect() {
        this.player.stop();
        this.voiceChannel.leave();
        this.player = null;
        await this.service.removeConnection(this.guild);
    }
}
exports.MusicConnection = MusicConnection;
//# sourceMappingURL=MusicConnection.js.map