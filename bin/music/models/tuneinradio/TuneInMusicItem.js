"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneInMusicItem = void 0;
const axios_1 = __importDefault(require("axios"));
const MusicItem_1 = require("../MusicItem");
const RADIO_TIME_URL = `https://opml.radiotime.com/Tune.ashx?render=json&id=`;
class TuneInMusicItem extends MusicItem_1.MusicItem {
    constructor(platform, info) {
        super(platform, info);
        this.description = info.description;
    }
    toSearchEntry(index) {
        return {
            name: `\`${index}\`: ${this.title}`,
            value: `${this.description}`
        };
    }
    async getStreamUrl() {
        const res = await axios_1.default.get(`${RADIO_TIME_URL}${this.id}`);
        return res.data.body[0].url;
    }
    getProgress(time) {
        return '```\n' + this.platform.service.formatTime(time) + '\n```';
    }
    doClone() {
        return new TuneInMusicItem(this.platform, this);
    }
}
exports.TuneInMusicItem = TuneInMusicItem;
//# sourceMappingURL=TuneInMusicItem.js.map