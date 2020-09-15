"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Soundcloud = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../../../types");
const MusicPlatform_1 = require("../MusicPlatform");
const SoundCloudMusicItem_1 = require("./SoundCloudMusicItem");
const SOUNDCLOUD_CLIENT_ID = 'Vu5tlmvC9eCLFZkxXG32N1yQMfDSAPAA';
class Soundcloud extends MusicPlatform_1.MusicPlatform {
    constructor(client) {
        super(client);
        this.supportsRewind = true;
        this.supportsSeek = true;
        this.supportsLyrics = false;
        this.supportsSearch = true;
    }
    isPlatformUrl(url) {
        if (!url) {
            return false;
        }
        return url.startsWith('https://soundcloud.com');
    }
    getType() {
        return types_1.MusicPlatformType.SoundCloud;
    }
    async getByLink(link) {
        link = encodeURIComponent(link);
        const scLink = `http://api.soundcloud.com/resolve?url=${link}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
        const scData = (await axios_1.default.get(scLink)).data;
        if (scData.kind !== 'track') {
            throw new Error('INVALID_PLATFORM_URL');
        }
        return new SoundCloudMusicItem_1.SoundcloudMusicItem(this, {
            id: scData.id.toString(),
            title: scData.title,
            link: scData.permalink_url,
            imageUrl: scData.artwork_url,
            artist: scData.user ? scData.user.username : '',
            audioUrl: `${scData.stream_url}?client_id=${SOUNDCLOUD_CLIENT_ID}`,
            duration: scData.duration
        });
    }
    async search(searchTerm, maxResults) {
        searchTerm = encodeURIComponent(searchTerm);
        const scLink = `http://api.soundcloud.com/tracks?q=${searchTerm}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
        const scData = (await axios_1.default.get(scLink)).data;
        return scData.map((item, index) => new SoundCloudMusicItem_1.SoundcloudMusicItem(this, {
            id: scData.id,
            title: scData.title,
            link: scData.permalink_url,
            imageUrl: scData.artwork_url,
            artist: scData.user ? scData.user.username : '',
            audioUrl: `${scData.stream_url}?client_id=${SOUNDCLOUD_CLIENT_ID}`,
            duration: scData.duration
        }));
    }
}
exports.Soundcloud = Soundcloud;
//# sourceMappingURL=SoundCloud.js.map