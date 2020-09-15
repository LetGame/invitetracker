"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundcloudMusicItem = void 0;
const axios_1 = __importDefault(require("axios"));
const MusicItem_1 = require("../MusicItem");
class SoundcloudMusicItem extends MusicItem_1.MusicItem {
    constructor(platform, info) {
        super(platform, info);
        this.duration = info.duration;
        this.audioUrl = info.audioUrl;
        this.artist = info.artist;
    }
    toSearchEntry(index) {
        return {
            name: `\`${index}\`: ${this.title} **${this.duration}**`,
            value: `Uploader: ${this.artist}`
        };
    }
    toQueueEntry() {
        const obj = super.toQueueEntry();
        const time = this.platform.service.formatTime(this.duration);
        obj.value += ` | Duration: ${time}`;
        return obj;
    }
    async getStreamUrl() {
        const redir = await axios_1.default.get(this.audioUrl);
        return redir.request.res.responseUrl;
    }
    toEmbed() {
        const base = super.toEmbed();
        base.fields = base.fields.concat([
            {
                name: 'Duration',
                value: this.platform.service.formatTime(this.duration / 1000)
            },
            { name: 'Artist', value: this.artist }
        ]);
        return base;
    }
    getProgress(time) {
        const progress = Math.max(0, Math.min(30, Math.round(30 * (time / this.duration))));
        return ('```\n[' +
            '='.repeat(progress) +
            ' '.repeat(30 - progress) +
            '] ' +
            this.platform.service.formatTime(time) +
            ' / ' +
            this.platform.service.formatTime(this.duration) +
            '\n```');
    }
    doClone() {
        return new SoundcloudMusicItem(this.platform, this);
    }
}
exports.SoundcloudMusicItem = SoundcloudMusicItem;
//# sourceMappingURL=SoundCloudMusicItem.js.map