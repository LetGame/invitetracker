"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.getBot,
            aliases: ['get-bot', 'invite-bot', 'inviteBot'],
            group: types_1.CommandGroup.Info,
            defaultAdminOnly: false,
            guildOnly: false
        });
    }
    async action(message, args, flags, { guild, t }) {
        const embed = this.createEmbed();
        const params = [];
        params.push(`origin=getbot`);
        params.push(`user=${message.author.id}`);
        if (guild) {
            params.push(`guild=${guild.id}`);
        }
        embed.description = `[Add InviteTracker to your server!]` + `(https://discord.com/api/oauth2/authorize?client_id=746396844946489504&permissions=8&scope=bot)`;
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=getBot.js.map