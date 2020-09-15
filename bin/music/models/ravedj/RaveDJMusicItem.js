"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaveDJMusicItem = void 0;
const MusicItem_1 = require("../MusicItem");
class RaveDJMusicItem extends MusicItem_1.MusicItem {
    constructor(platform, info) {
        super(platform, info);
        this.duration = info.duration;
        this.artist = info.artist;
        this.audioUrl = info.audioUrl;
        this.medias = info.medias;
    }
    toSearchEntry(index) {
        return {
            name: `\`${index}\`: ${this.title} **${this.duration}**`,
            value: `Link: ${this.link}`
        };
    }
    toQueueEntry() {
        const obj = super.toQueueEntry();
        const time = this.platform.service.formatTime(this.duration);
        obj.value += ` | Duration: ${time}`;
        return obj;
    }
    async getStreamUrl() {
        return this.audioUrl;
    }
    toEmbed() {
        const obj = super.toEmbed();
        obj.fields = obj.fields.concat([
            {
                name: 'Duration',
                value: this.platform.service.formatTime(this.duration)
            },
            {
                name: 'Songs contained',
                value: this.medias
                    .slice(0, 10) // TODO
                    .map((medium, index) => `${index}: [${medium.title}](https://youtube.com/watch?v=${medium.providerId})`)
                    .join('\n')
            }
        ]);
        return obj;
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
        return new RaveDJMusicItem(this.platform, this);
    }
}
exports.RaveDJMusicItem = RaveDJMusicItem;
//# sourceMappingURL=RaveDJMusicItem.js.map