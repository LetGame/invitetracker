"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlatformService = void 0;
const Service_1 = require("../../framework/services/Service");
const types_1 = require("../../types");
const IHeartRadio_1 = require("../models/iheartradio/IHeartRadio");
const RaveDJ_1 = require("../models/ravedj/RaveDJ");
const SoundCloud_1 = require("../models/soundcloud/SoundCloud");
const TuneInRadio_1 = require("../models/tuneinradio/TuneInRadio");
const Youtube_1 = require("../models/youtube/Youtube");
class MusicPlatformService extends Service_1.IMService {
    constructor() {
        super(...arguments);
        this.platforms = new Map();
    }
    async init() {
        this.platforms.set(types_1.MusicPlatformType.YouTube, new Youtube_1.Youtube(this.client));
        this.platforms.set(types_1.MusicPlatformType.SoundCloud, new SoundCloud_1.Soundcloud(this.client));
        this.platforms.set(types_1.MusicPlatformType.RaveDJ, new RaveDJ_1.RaveDJ(this.client));
        this.platforms.set(types_1.MusicPlatformType.iHeartRADIO, new IHeartRadio_1.IHeartRadio(this.client));
        this.platforms.set(types_1.MusicPlatformType.TuneIn, new TuneInRadio_1.TuneInRadio(this.client));
    }
    get(platform) {
        return this.platforms.get(platform);
    }
    getForLink(link) {
        for (const v of this.platforms.values()) {
            if (v.isPlatformUrl(link)) {
                return v;
            }
        }
    }
}
exports.MusicPlatformService = MusicPlatformService;
//# sourceMappingURL=MusicPlatformService.js.map