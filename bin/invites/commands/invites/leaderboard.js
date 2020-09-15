"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../../framework/commands/Command");
const GuildSetting_1 = require("../../../framework/models/GuildSetting");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const usersPerPage = 10;
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.leaderboard,
            aliases: ['top'],
            args: [
                {
                    name: 'page',
                    resolver: resolvers_1.NumberResolver
                }
            ],
            flags: [],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: false,
            extraExamples: ['!leaderboard 1mo', '!leaderboard 30d 6']
        });
    }
    async action(message, [_page], flags, { guild, t, settings }) {
        let invs = await this.client.cache.leaderboard.get(guild.id);
        const meta = this.client.cache.leaderboard.getCacheMeta(guild.id);
        if (settings.hideLeftMembersFromLeaderboard) {
            invs = invs.filter((e) => guild.members.has(e.id));
        }
        // Get the member settings everytime because it's not that much work
        // and because we want the 'hideFromLeaderboard' setting to work immediatly
        const memSets = await this.client.cache.members.get(guild.id);
        invs = invs.filter((e) => !memSets.has(e.id) || !memSets.get(e.id).hideFromLeaderboard);
        const fromText = t('cmd.leaderboard.from', {
            from: `**${moment_1.default(guild.createdAt).locale(settings.lang).fromNow()}**`
        });
        const lastUpdateText = t('cmd.leaderboard.lastUpdate', {
            lastUpdate: `**${meta.cachedAt.locale(settings.lang).fromNow()}**`,
            nextUpdate: `**${meta.validUntil.locale(settings.lang).fromNow()}**`
        });
        if (invs.length === 0) {
            const embed = this.createEmbed({
                title: t('cmd.leaderboard.title'),
                description: `${fromText}\n(${lastUpdateText})\n\n**${t('cmd.leaderboard.noInvites')}**`
            });
            return this.sendReply(message, embed);
        }
        const maxPage = Math.ceil(invs.length / usersPerPage);
        const p = Math.max(Math.min(_page ? _page - 1 : 0, maxPage - 1), 0);
        const style = settings.leaderboardStyle;
        // Show the leaderboard as a paginated list
        await this.showPaginated(message, p, maxPage, (page) => {
            let str = `${fromText}\n(${lastUpdateText})\n\n`;
            // Collect texts first to possibly make a table
            const lines = [];
            const lengths = [2, 1, 4, 1, 1, 1, 1];
            if (style === GuildSetting_1.LeaderboardStyle.table) {
                lines.push([
                    '#',
                    t('cmd.leaderboard.col.name'),
                    t('cmd.leaderboard.col.total'),
                    t('cmd.leaderboard.col.regular'),
                    t('cmd.leaderboard.col.custom'),
                    t('cmd.leaderboard.col.fake'),
                    t('cmd.leaderboard.col.leave')
                ]);
                lines.push(lines[0].map((h) => '―'.repeat(h.length + 1)));
            }
            invs.slice(page * usersPerPage, (page + 1) * usersPerPage).forEach((inv, i) => {
                const pos = page * usersPerPage + i + 1;
                const name = style === GuildSetting_1.LeaderboardStyle.mentions ? `<@${inv.id}>` : inv.name.substring(0, 10);
                const line = [
                    `${pos}.`,
                    name,
                    `${inv.total} `,
                    `${inv.regular} `,
                    `${inv.custom} `,
                    `${inv.fakes} `,
                    `${inv.leaves} `
                ];
                lines.push(line);
                lengths.forEach((l, pIndex) => (lengths[pIndex] = Math.max(l, Array.from(line[pIndex]).length)));
            });
            // Put string together
            if (style === GuildSetting_1.LeaderboardStyle.table) {
                str += '```diff\n';
            }
            lines.forEach((line) => {
                if (style === GuildSetting_1.LeaderboardStyle.table) {
                    line.forEach((part, partIndex) => {
                        str += part + ' '.repeat(lengths[partIndex] - part.length + 2);
                    });
                }
                else if (style === GuildSetting_1.LeaderboardStyle.normal || style === GuildSetting_1.LeaderboardStyle.mentions) {
                    str += t('cmd.leaderboard.entry', {
                        pos: line[0],
                        name: line[1],
                        total: line[2],
                        regular: line[3],
                        custom: line[4],
                        fake: line[5],
                        leave: line[6]
                    });
                }
                str += '\n';
            });
            if (style === GuildSetting_1.LeaderboardStyle.table) {
                str += '\n```\n' + t('cmd.leaderboard.legend');
            }
            return this.createEmbed({
                title: t('cmd.leaderboard.title'),
                description: str
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=leaderboard.js.map