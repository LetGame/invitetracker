"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IHeartMusicItem = void 0;
const MusicItem_1 = require("../MusicItem");
const iheart = require('iheart');
class IHeartMusicItem extends MusicItem_1.MusicItem {
    constructor(platform, info) {
        super(platform, info);
        this.station = info.station;
    }
    toSearchEntry(index) {
        return {
            name: `\`${index}\`: ${this.title}`,
            value: `Link: ${this.link}`
        };
    }
    getStreamUrl() {
        return iheart.streamURL(this.station);
    }
    toEmbed() {
        const base = super.toEmbed();
        base.fields = base.fields.concat([
            {
                name: 'Air',
                value: `${this.station.frequency} ${this.station.band}`,
                inline: true
            },
            {
                name: 'Location',
                value: `${this.station.city}, ${this.station.state}`,
                inline: true
            },
            {
                name: 'Description',
                value: this.station.description,
                inline: false
            }
        ]);
        return base;
    }
    getProgress(time) {
        return '```\n' + this.platform.service.formatTime(time) + '\n```';
    }
    doClone() {
        return new IHeartMusicItem(this.platform, this);
    }
}
exports.IHeartMusicItem = IHeartMusicItem;
//# sourceMappingURL=IHeartMusicItem.js.map