"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaveDJ = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../../../types");
const MusicPlatform_1 = require("../MusicPlatform");
const RaveDJMusicItem_1 = require("./RaveDJMusicItem");
const RAVE_DJ_GOOGLE_KEY = 'AIzaSyCB24TzTgYXl4sXwLyeY8y-XXgm0RX_eRQ';
class RaveDJ extends MusicPlatform_1.MusicPlatform {
    constructor(client) {
        super(client);
        this.supportsRewind = true;
        this.supportsSeek = true;
        this.supportsLyrics = false;
        this.supportsSearch = false;
        // TODO: Deactivate service if not available
        this.getIdToken().catch(() => undefined);
    }
    isPlatformUrl(url) {
        if (!url) {
            return false;
        }
        return url.startsWith('https://rave.dj');
    }
    getType() {
        return types_1.MusicPlatformType.RaveDJ;
    }
    async getIdToken() {
        const { data } = await axios_1.default.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${RAVE_DJ_GOOGLE_KEY}`, null, {
            headers: {
                Referer: 'https://rave.dj/'
            }
        });
        this.idToken = data.idToken;
    }
    async getByLink(link) {
        const id = link.substr(link.indexOf('.dj/') + 4);
        const url = `https://api.red.wemesh.ca/ravedj/${id}`;
        const opts = {
            headers: {
                authorization: `bearer ${this.idToken}`,
                'client-version': '5.0',
                'wemesh-api-version': '5.0',
                'wemesh-platform': 'Android',
                'content-type': 'application/json'
            }
        };
        const res = await axios_1.default.get(url, opts).catch(async (err) => {
            if (err.code === 401) {
                await this.getIdToken();
            }
            return axios_1.default.get(url, opts);
        });
        const data = res.data.data;
        if (!data) {
            throw new Error('INVALID_PLATFORM_URL');
        }
        return new RaveDJMusicItem_1.RaveDJMusicItem(this, {
            id: data.id,
            title: data.title,
            link: `https://rave.dj/${data.id}`,
            imageUrl: data.thumbnails.default,
            artist: data.artist,
            audioUrl: data.urls.audio,
            duration: data.duration,
            medias: data.media
        });
    }
    search(searchTerm, maxResults) {
        throw new Error('Method not implemented.');
    }
    async mix(video1, video2) {
        const requestObject = {
            style: 'MASHUP',
            title: null,
            media: [
                {
                    providerId: video1,
                    provider: 'YOUTUBE'
                },
                {
                    providerId: video2,
                    provider: 'YOUTUBE'
                }
            ]
        };
        const options = {
            method: 'POST',
            url: 'https://api.red.wemesh.ca/ravedj',
            data: requestObject,
            headers: {
                authorization: `bearer ${this.idToken}`,
                'client-version': '5.0',
                'wemesh-api-version': '5.0',
                'wemesh-platform': 'Android',
                'content-type': 'application/json'
            }
        };
        const { data } = await axios_1.default(options).catch(async (err) => {
            if (err.code === 401) {
                await this.getIdToken();
            }
            return axios_1.default(options);
        });
        return data.data.id;
    }
}
exports.RaveDJ = RaveDJ;
//# sourceMappingURL=RaveDJ.js.map