"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IHeartRadio = void 0;
const types_1 = require("../../../types");
const MusicPlatform_1 = require("../MusicPlatform");
const IHeartMusicItem_1 = require("./IHeartMusicItem");
const iheart = require('iheart');
class IHeartRadio extends MusicPlatform_1.MusicPlatform {
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
        return url.startsWith('iheart');
    }
    getType() {
        return types_1.MusicPlatformType.iHeartRADIO;
    }
    getByLink(link) {
        return this.search(link, 1).then((res) => res[0]);
    }
    async search(searchTerm, maxResults = 10) {
        const matches = await iheart.search(searchTerm);
        return matches.stations.map((station) => new IHeartMusicItem_1.IHeartMusicItem(this, {
            id: null,
            title: station.name,
            imageUrl: station.newlogo,
            link: '',
            station: station
        }));
    }
}
exports.IHeartRadio = IHeartRadio;
//# sourceMappingURL=IHeartRadio.js.map