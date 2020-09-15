"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
var ExportType;
(function (ExportType) {
    ExportType["leaderboard"] = "leaderboard";
})(ExportType || (ExportType = {}));
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.export,
            aliases: [],
            args: [
                {
                    name: 'type',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(ExportType)),
                    required: true
                }
            ],
            group: types_1.CommandGroup.Premium,
            guildOnly: true,
            defaultAdminOnly: true,
            premiumOnly: true,
            extraExamples: ['!export leaderboard']
        });
    }
    async action(message, [type], flags, { guild, t, isPremium }) {
        const embed = this.createEmbed({
            title: t('cmd.export.title')
        });
        embed.description = t('cmd.export.preparing');
        switch (type) {
            case ExportType.leaderboard:
                const msg = await this.sendReply(message, embed);
                if (!msg) {
                    return;
                }
                if (type === 'leaderboard') {
                    let csv = 'Id,Name,Total Invites,Regular,Custom,Fake,Leaves\n';
                    const invs = await this.client.invs.generateLeaderboard(guild.id);
                    invs.forEach((inv) => {
                        csv +=
                            `${inv.id},` +
                                `"${inv.name.replace(/"/g, '\\"')}",` +
                                `${inv.total},` +
                                `${inv.regular},` +
                                `${inv.custom},` +
                                `${inv.fakes},` +
                                `${inv.leaves},` +
                                `\n`;
                    });
                    return message.channel
                        .createMessage('', {
                        file: Buffer.from(csv),
                        name: 'InviteManagerExport.csv'
                    })
                        .then(() => msg.delete().catch(() => undefined))
                        .catch(() => undefined);
                }
                break;
            default:
                return;
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=export.js.map