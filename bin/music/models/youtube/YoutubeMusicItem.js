"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeMusicItem = void 0;
const MusicItem_1 = require("../MusicItem");
class YoutubeMusicItem extends MusicItem_1.MusicItem {
    constructor(platform, info) {
        super(platform, info);
        this.duration = info.duration;
        this.channel = info.channel;
    }
    toSearchEntry(index) {
        return {
            name: `\`${index}\`: ${this.title} **${this.platform.service.formatTime(this.duration)}**`,
            value: `Uploader: ${this.channel}`
        };
    }
    toQueueEntry() {
        const obj = super.toQueueEntry();
        const time = this.platform.service.formatTime(this.duration);
        obj.value += ` | Duration: ${time}`;
        return obj;
    }
    async getStreamUrl() {
        return this.link;
    }
    toEmbed() {
        const base = super.toEmbed();
        base.fields = base.fields.concat([
            {
                name: 'Duration',
                value: this.platform.service.formatTime(this.duration)
            },
            { name: 'Channel', value: this.channel }
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
        return new YoutubeMusicItem(this.platform, this);
    }
}
exports.YoutubeMusicItem = YoutubeMusicItem;
//# sourceMappingURL=YoutubeMusicItem.js.map