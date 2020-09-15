"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.invites,
            aliases: ['invite', 'rank'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: false,
            extraExamples: ['!invites @User', '!invites "User with space"']
        });
    }
    async action(message, [user], flags, { guild, t, me }) {
        const target = user ? user : message.author;
        const invites = await this.client.cache.invites.getOne(guild.id, target.id);
        let textMessage = '';
        if (target.id === message.author.id) {
            textMessage = t('cmd.invites.amount.self', {
                total: `**${invites.total}**`,
                regular: `**${invites.regular}**`,
                custom: `**${invites.custom}**`,
                fake: `**${invites.fake}**`,
                leave: `**${invites.leave}**`
            });
        }
        else {
            textMessage = t('cmd.invites.amount.other', {
                target: `<@${target.id}>`,
                total: `**${invites.total}**`,
                regular: `**${invites.regular}**`,
                custom: `**${invites.custom}**`,
                fake: `**${invites.fake}**`,
                leave: `**${invites.leave}**`
            });
        }
        textMessage += '\n';
        let targetMember = guild.members.get(target.id);
        if (!targetMember) {
            targetMember = await guild.getRESTMember(target.id).catch(() => undefined);
        }
        // Only process if the user is still in the guild
        if (targetMember && !targetMember.user.bot) {
            const promoteInfo = await this.client.invs.promoteIfQualified(guild, targetMember, me, invites.total);
            if (promoteInfo) {
                const { nextRank, nextRankName, numRanks, shouldHave, shouldNotHave, dangerous } = promoteInfo;
                if (nextRank) {
                    const nextRankPointsDiff = nextRank.numInvites - invites.total;
                    if (message.author.id === target.id) {
                        textMessage += t('cmd.invites.nextRank.self', {
                            nextRankPointsDiff,
                            nextRankName
                        });
                    }
                    else {
                        textMessage += t('cmd.invites.nextRank.other', {
                            target: `<@${target.id}>`,
                            nextRankPointsDiff,
                            nextRankName
                        });
                    }
                    textMessage += '\n';
                }
                else {
                    if (numRanks > 0) {
                        if (message.author.id === target.id) {
                            textMessage += t('cmd.invites.highestRank.self');
                        }
                        else {
                            textMessage += t('cmd.invites.highestRank.other', {
                                target: `<@${target.id}>`
                            });
                        }
                        textMessage += '\n';
                    }
                    textMessage += '\n';
                }
                if (shouldHave.length > 0) {
                    textMessage +=
                        '\n\n' +
                            t('roles.shouldHave', {
                                shouldHave: shouldHave.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
                if (shouldNotHave.length > 0) {
                    textMessage +=
                        '\n\n' +
                            t('roles.shouldNotHave', {
                                shouldNotHave: shouldNotHave.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
                if (dangerous.length > 0) {
                    textMessage +=
                        '\n\n' +
                            t('roles.dangerous', {
                                dangerous: dangerous.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
            }
        }
        const embed = this.createEmbed({
            title: target.username,
            description: textMessage
        });
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=invites.js.map