"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneInRadio = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../../../types");
const MusicPlatform_1 = require("../MusicPlatform");
const TuneInMusicItem_1 = require("./TuneInMusicItem");
const BASE_URL = 'https://api.tunein.com/';
const LINK_REGEX = /-(s\d+)\/$/;
class TuneInRadio extends MusicPlatform_1.MusicPlatform {
    constructor(client) {
        super(client);
        this.supportsRewind = false;
        this.supportsSeek = false;
        this.supportsLyrics = false;
        this.supportsSearch = true;
    }
    isPlatformUrl(url) {
        if (!url) {
            return false;
        }
        return url.startsWith('tunein');
    }
    getType() {
        return types_1.MusicPlatformType.iHeartRADIO;
    }
    async getByLink(link) {
        const matches = LINK_REGEX.exec(link);
        if (matches) {
            const id = matches[1];
            const res = await axios_1.default.get(`${BASE_URL}profiles/${id}&formats=mp3,aac,ogg`);
            const station = res.data.Item;
            return new TuneInMusicItem_1.TuneInMusicItem(this, {
                id: station.GuideId,
                title: station.Title,
                imageUrl: station.Image,
                link: station.Actions.Share.ShareUrl,
                description: station.Subtitle
            });
        }
        else {
            return this.search(link, 1).then((res) => res[0]);
        }
    }
    async search(searchTerm, maxResults = 10) {
        const search = encodeURIComponent(searchTerm);
        const res = await axios_1.default.get(`${BASE_URL}profiles?fullTextSearch=true&formats=mp3,aac,ogg&query=${search}`);
        const stations = res.data.Items.find((i) => i.ContainerType === 'Stations');
        if (!stations) {
            return [];
        }
        return stations.Children.slice(0, maxResults).map((station) => new TuneInMusicItem_1.TuneInMusicItem(this, {
            id: station.GuideId,
            title: station.Title,
            imageUrl: station.Image,
            link: station.Actions.Share.ShareUrl,
            description: station.Subtitle
        }));
    }
}
exports.TuneInRadio = TuneInRadio;
//# sourceMappingURL=TuneInRadio.js.map