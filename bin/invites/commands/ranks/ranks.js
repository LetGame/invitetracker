"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const RANKS_PER_PAGE = 10;
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.ranks,
            aliases: ['show-ranks', 'showRanks'],
            args: [
                {
                    name: 'page',
                    resolver: resolvers_1.NumberResolver
                }
            ],
            group: types_1.CommandGroup.Ranks,
            guildOnly: true,
            defaultAdminOnly: false
        });
    }
    async action(message, [_page], flags, { guild, t }) {
        const ranks = await this.client.cache.ranks.get(guild.id);
        if (ranks.length === 0) {
            return this.sendReply(message, t('cmd.ranks.none'));
        }
        const maxPage = Math.ceil(ranks.length / RANKS_PER_PAGE);
        const startPage = Math.max(Math.min(_page ? _page - 1 : 0, maxPage - 1), 0);
        await this.showPaginated(message, startPage, maxPage, (page) => {
            let description = '';
            ranks.slice(page * RANKS_PER_PAGE, (page + 1) * RANKS_PER_PAGE).forEach((rank) => {
                description +=
                    t('cmd.ranks.entry', {
                        role: `<@&${rank.roleId}>`,
                        numInvites: rank.numInvites,
                        description: rank.description
                    }) + '\n';
            });
            return this.createEmbed({
                title: t('cmd.ranks.title'),
                description
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=ranks.js.map