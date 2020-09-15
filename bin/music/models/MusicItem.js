"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicItem = void 0;
class MusicItem {
    constructor(platform, info) {
        this.platform = platform;
        this.id = info.id;
        this.title = info.title;
        this.link = info.link;
        this.imageUrl = info.imageUrl;
    }
    getPlatform() {
        return this.platform;
    }
    setAuthor(author) {
        this.author = author;
    }
    toSearchEntry(index) {
        return {
            name: `${index}. ${this.title}`,
            value: ''
        };
    }
    toQueueEntry() {
        return {
            name: this.title,
            value: `Added by: ${this.author.username}`
        };
    }
    toEmbed() {
        return {
            url: this.link,
            image: { url: this.imageUrl },
            title: this.title,
            fields: []
        };
    }
    clone() {
        const item = this.doClone();
        item.setAuthor(this.author);
        return item;
    }
    toString() {
        return this.platform.getType() + ':' + this.id;
    }
}
exports.MusicItem = MusicItem;
//# sourceMappingURL=MusicItem.js.map