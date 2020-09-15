"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.MusicCommand.queue,
            aliases: [],
            group: types_1.CommandGroup.Music,
            guildOnly: true,
            defaultAdminOnly: false,
            premiumOnly: true
        });
    }
    async action(message, args, flags, { t, guild }) {
        const conn = await this.client.music.getMusicConnection(guild);
        const nowPlaying = conn.getNowPlaying();
        const queue = conn.getQueue();
        if (!nowPlaying) {
            await this.sendReply(message, t('cmd.queue.empty'));
            return;
        }
        await this.sendReply(message, {
            author: {
                name: `${nowPlaying.author.username}#${nowPlaying.author.discriminator}`,
                icon_url: nowPlaying.author.avatarURL
            },
            description: nowPlaying.toQueueEntry().value,
            thumbnail: { url: nowPlaying.imageUrl },
            title: nowPlaying.title,
            fields: queue.map((item) => item.toQueueEntry())
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=queue.js.map